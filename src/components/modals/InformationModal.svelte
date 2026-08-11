<script lang="ts">
   import { translationStore } from "../../lib/stores";
   import { version } from '../../../package.json';
   import logo from '../../../src-tauri/icons/icon-pseudoflow.png';
</script>

<img src={logo} alt="PseudoFlow" class="logo" />
<div class="version">{$translationStore.APP_INFO_VERSION}: {version}</div>
<p class="description">{$translationStore.APP_INFO_DESCRIPTION}</p>

<a class="website" href="https://www.pseudoflow.app" target="_blank">pseudoflow.app</a>

<hr class="separator" />

<p class="privacy">{$translationStore.APP_INFO_PRIVACY}</p>

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

  .description {
    margin: 0 0 8px 0;
    line-height: 1.5;
  }

  .website {
    display: block;
    margin-bottom: 16px;
  }

  .separator {
    border: 0;
    border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    margin: 16px 0 12px 0;
  }

  .privacy {
    margin: 0;
    font-size: 0.85em;
    opacity: 0.7;
  }
</style>