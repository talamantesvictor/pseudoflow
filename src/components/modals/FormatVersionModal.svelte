<script lang="ts">
  import { translationStore } from "../../lib/stores";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  const dismiss = () => {
    dispatch("closeModal");
  };
</script>

<b>{$translationStore.APP_FILE_OLD_FORMAT}</b><br>
<span>{$translationStore.APP_FILE_OLD_FORMAT_DESC}</span>
<div class="link-wrapper">
  <a href="https://www.pseudoflow.app" target="_blank">pseudoflow.app</a>
</div>

<div class="buttons">
  <button class="button" on:click={dismiss}>
    {$translationStore.APP_FILE_OLD_FORMAT_DISMISS}
  </button>
</div>

<style lang="scss">
  @use "../../styles/variables.scss" as *;

  span {
    color: $linenumbers-foreground;
  }

  .link-wrapper {
    margin-top: 1rem;
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }
</style>
