<script lang="ts">
   import { translationStore } from "../../lib/stores";
   import { version } from '../../../package.json';
</script>

{$translationStore.APP_INFO_VERSION}: {version}<br><br>
{$translationStore.APP_INFO_DESCRIPTION}<br><br>

<a href="https://www.pseudoflow.app" target="_blank">pseudoflow.app</a>

<style lang="scss">
   @import "../../styles/variables.scss";
   
   a {
      text-decoration: none;
      color: $accent-color;
   }
</style>