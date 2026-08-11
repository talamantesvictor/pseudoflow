<script lang="ts">
   import { translationStore } from "../../lib/stores";
   import { version } from '../../../package.json';
   import logo from '../../../src-tauri/icons/icon-pseudoflow.png';
</script>

<img src={logo} alt="PseudoFlow" class="logo" />
<div class="version">{$translationStore.APP_INFO_VERSION}: {version}</div>
{$translationStore.APP_INFO_DESCRIPTION}<br><br>

<a href="https://www.pseudoflow.app" target="_blank">pseudoflow.app</a>
<br><br>
{$translationStore.APP_INFO_PRIVACY}<br>
<a href="https://github.com/talamantesvictor/pseudoflow/blob/main/PRIVACY.md" target="_blank">{$translationStore.APP_INFO_PRIVACY_LINK}</a>

<style lang="scss">
  .logo {
    display: block;
    width: 64px;
    height: 64px;
    margin: 0 auto 12px auto;
  }

  .version {
    text-align: center;
    margin-bottom: 12px;
  }
</style>