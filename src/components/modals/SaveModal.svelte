<script lang="ts">
   import { translationStore } from "../../lib/stores";
</script>

<b>{$translationStore.APP_SAVE_QUESTION}</b><br>
<span>{$translationStore.APP_SAVE_DISCLAIMER}</span><br>

<style lang="scss">
   @import "../../styles/variables.scss";
   
   span {
      color: $linenumbers-foreground;
   }
</style>