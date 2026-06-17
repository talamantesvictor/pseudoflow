declare const __FORMAT_VERSION__: string;
declare const __MIN_FORMAT_VERSION__: string;

const FORMAT_VERSION: string = __FORMAT_VERSION__;
const MIN_FORMAT_VERSION: string = __MIN_FORMAT_VERSION__;

export interface PffMeta {
  format: "pseudoflow";
  format_version: string;
  version: string;
  lang: "en" | "es";
  created: string;
  modified: string;
}

export interface ParseResult {
  meta: PffMeta | null;
  content: string;
  oldFormat: boolean;
}

const SEPARATOR = "\n---\n";

function validateMeta(meta: any): meta is PffMeta {
  return (
    meta.format === "pseudoflow" &&
    typeof meta.format_version === "string" &&
    typeof meta.version === "string" &&
    (meta.lang === "en" || meta.lang === "es") &&
    typeof meta.created === "string" &&
    typeof meta.modified === "string"
  );
}

export function parsePffFile(raw: string): ParseResult {
  const sepIndex = raw.indexOf(SEPARATOR);

  if (sepIndex !== -1) {
    const headerStr = raw.substring(0, sepIndex);
    if (headerStr.startsWith("{")) {
      try {
        const meta = JSON.parse(headerStr);
        if (validateMeta(meta)) {
          const content = raw.substring(sepIndex + SEPARATOR.length);
          const oldFormat = compareVersions(meta.format_version, MIN_FORMAT_VERSION) < 0;
          return { meta, content, oldFormat };
        }
      } catch {}
    }

    const content = raw.substring(sepIndex + SEPARATOR.length);
    return { meta: null, content, oldFormat: false };
  }

  return { meta: null, content: raw, oldFormat: false };
}

export function serializePffFile(meta: PffMeta, content: string): string {
  return JSON.stringify(meta) + SEPARATOR + content;
}

export function createPffMeta(lang: string, appVersion: string): PffMeta {
  const now = new Date().toISOString();
  return {
    format: "pseudoflow",
    format_version: FORMAT_VERSION,
    version: appVersion,
    lang: lang as "en" | "es",
    created: now,
    modified: now,
  };
}

export function updatePffMeta(meta: PffMeta, appVersion: string): PffMeta {
  return {
    ...meta,
    format_version: FORMAT_VERSION,
    version: appVersion,
    modified: new Date().toISOString(),
  };
}

export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}
