#!/usr/bin/env bash
set -euo pipefail

REPO="talamantesvictor/pseudoflow"
APP_NAME="pseudoflow"
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { printf "${BLUE}→${NC} %s\n" "$1"; }
ok()    { printf "${GREEN}✓${NC} %s\n" "$1"; }
warn()  { printf "${YELLOW}!${NC} %s\n" "$1"; }
err()   { printf "${RED}✗${NC} %s\n" "$1" >&2; exit 1; }

detect_os() {
	if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "linux-musl"* ]]; then
		echo "linux"
	elif [[ "$OSTYPE" == "darwin"* ]]; then
		echo "macos"
	else
		err "Unsupported OS: $OSTYPE"
	fi
}

detect_arch() {
	local arch
	arch=$(uname -m)
	case "$arch" in
		x86_64|amd64)  echo "x86_64" ;;
		aarch64|arm64) echo "aarch64" ;;
		*) err "Unsupported architecture: $arch" ;;
	esac
}

fetch_latest_release() {
	local api_url="https://api.github.com/repos/${REPO}/releases/latest"
	local tag
	tag=$(curl -sL "$api_url" | grep '"tag_name":' | head -1 | sed -E 's/.*"tag_name": *"([^"]+)".*/\1/')
	if [[ -z "$tag" ]]; then
		err "Failed to fetch latest release from GitHub API"
	fi
	echo "$tag"
}

find_asset() {
	local tag="$1" os="$2" arch="$3"
	local version="${tag#v}"

	case "$os" in
		linux)
			case "$arch" in
				x86_64)  printf "pseudoflow_%s_amd64.AppImage" "$version" ;;
				aarch64) printf "pseudoflow_%s_aarch64.AppImage" "$version" ;;
			esac
			;;
		macos)
			case "$arch" in
				x86_64)  printf "pseudoflow_%s_x64.dmg" "$version" ;;
				aarch64) printf "pseudoflow_%s_aarch64.dmg" "$version" ;;
			esac
			;;
	esac
}

extract_icon() {
	local appimage="$1" dest="$2"

	local mount_point
	mount_point=$(mktemp -d)

	"$appimage" --appimage-mount "$mount_point" &
	local mount_pid=$!

	local found=""
	for ((i=0; i<30; i++)); do
		if mountpoint -q "$mount_point" 2>/dev/null; then
			found=1
			break
		fi
		sleep 0.1
	done

	if [[ -z "$found" ]]; then
		kill "$mount_pid" 2>/dev/null || true
		rmdir "$mount_point" 2>/dev/null || true
		warn "Could not mount AppImage to extract icon, falling back to embedded icon"
		return 1
	fi

	local icon_path=""
	local search_paths=(
		"$mount_point/usr/share/icons/hicolor/256x256/apps/${APP_NAME}.png"
		"$mount_point/usr/share/icons/hicolor/128x128/apps/${APP_NAME}.png"
		"$mount_point/usr/share/icons/hicolor/256x256@2/apps/${APP_NAME}.png"
		"$mount_point/usr/share/icons/hicolor/0x0/apps/${APP_NAME}.png"
		"$mount_point/${APP_NAME}.png"
		"$mount_point/icon.png"
	)
	for p in "${search_paths[@]}"; do
		if [[ -f "$p" ]]; then
			icon_path="$p"
			break
		fi
	done

	if [[ -z "$icon_path" ]]; then
		# try glob
		icon_path=$(find "$mount_point" -maxdepth 5 -name "app.pseudoflow.png" -o -name "${APP_NAME}.png" 2>/dev/null | head -1)
	fi

	if [[ -n "$icon_path" && -f "$icon_path" ]]; then
		mkdir -p "$(dirname "$dest")"
		cp "$icon_path" "$dest"
		ok "Icon extracted from AppImage"
	else
		warn "No icon found in AppImage"
	fi

	fusermount -u "$mount_point" 2>/dev/null || umount "$mount_point" 2>/dev/null || true
	kill "$mount_pid" 2>/dev/null || true
	wait "$mount_pid" 2>/dev/null
	rmdir "$mount_point" 2>/dev/null || true

	if [[ -f "$dest" ]]; then
		return 0
	fi
	return 1
}

install_linux() {
	local version="$1" asset_url="$2" asset_name="$3"

	local install_dir="${HOME}/.local/bin"
	local appimage="$install_dir/$APP_NAME"

	mkdir -p "$install_dir"
	info "Downloading $asset_name ..."
	curl -fSL --progress-bar -o "$appimage" "$asset_url"
	chmod +x "$appimage"
	ok "Installed to $appimage"

	if ! [[ ":$PATH:" == *":$install_dir:"* ]]; then
		warn "$install_dir is not in your PATH"
		echo "  Add this to your shell config (~/.bashrc, ~/.zshrc):"
		echo "  export PATH=\"$install_dir:\$PATH\""
	fi

	local icon_dir="${HOME}/.local/share/icons/hicolor/256x256/apps"
	local icon_file="$icon_dir/${APP_NAME}.png"
	extract_icon "$appimage" "$icon_file" || true

	local desktop_dir="${HOME}/.local/share/applications"
	mkdir -p "$desktop_dir"
	local desktop_file="$desktop_dir/${APP_NAME}.desktop"

	local icon_value
	if [[ -f "$icon_file" ]]; then
		icon_value="$APP_NAME"
	else
		warn "Falling back to AppImage as icon source"
		icon_value="$appimage"
	fi

	cat > "$desktop_file" <<EOF
[Desktop Entry]
Name=PseudoFlow
Comment=Pseudocode flowchart editor
Exec=$appimage
Icon=$icon_value
Type=Application
Categories=Development;IDE;
Terminal=false
EOF
	ok "Desktop entry created at $desktop_file"

	if [[ "$icon_value" == "$APP_NAME" ]]; then
		info "Icon installed at $icon_file"
	fi
}

install_macos() {
	local version="$1" asset_url="$2" asset_name="$3" arch="$4"

	local temp_dmg="/tmp/${APP_NAME}.dmg"
	info "Downloading $asset_name ..."
	if ! curl -fsSL -o "$temp_dmg" "$asset_url"; then
		err "Download failed. No macOS ${arch} build available for v${version}."
	fi

	info "Mounting DMG ..."
	local mount_point
	mount_point=$(hdiutil attach "$temp_dmg" -nobrowse -noautoopen 2>/dev/null | grep /Volumes | awk '{print $3}')
	if [[ -z "$mount_point" ]]; then
		err "Failed to mount DMG"
	fi

	local app_bundle=""
	for d in "$mount_point"/*.app; do
		if [[ -d "$d" ]]; then
			app_bundle="$d"
			break
		fi
	done

	if [[ -z "$app_bundle" ]]; then
		hdiutil detach "$mount_point" -quiet 2>/dev/null || true
		err "No .app bundle found in DMG"
	fi

	rm -rf "/Applications/${APP_NAME}.app" 2>/dev/null || true
	cp -R "$app_bundle" /Applications/
	hdiutil detach "$mount_point" -quiet 2>/dev/null || true
	rm -f "$temp_dmg"

	xattr -cr "/Applications/${APP_NAME}.app" 2>/dev/null || true
	ok "Installed to /Applications/${APP_NAME}.app"
}

main() {
	local os arch tag version asset_name asset_url

	os=$(detect_os)
	arch=$(detect_arch)

	info "Detected: $os / $arch"

	tag=$(fetch_latest_release)
	version="${tag#v}"
	asset_name=$(find_asset "$tag" "$os" "$arch")

	asset_url="https://github.com/${REPO}/releases/download/${tag}/${asset_name}"

	info "Latest version: $version"

	if [[ "$os" == "linux" ]]; then
		install_linux "$version" "$asset_url" "$asset_name"
	elif [[ "$os" == "macos" ]]; then
		install_macos "$version" "$asset_url" "$asset_name" "$arch"
	fi

	ok "PseudoFlow $version installed successfully"
}

main "$@"
