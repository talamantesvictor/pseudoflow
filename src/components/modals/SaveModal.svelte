<script lang="ts">
   import { translationStore } from "../../lib/stores";
</script>

<b>{$translationStore.APP_SAVE_QUESTION}</b><br>
<span>{$translationStore.APP_SAVE_DISCLAIMER}</span><br>

<style lang="scss">
   @use "../../styles/variables.scss" as *;
   
   span {
      color: $linenumbers-foreground;
   }
</style>