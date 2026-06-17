<script lang="ts">
  import { translationStore, changecodeWordsStore, changeTranslation } from "../../lib/stores";
  import { createEventDispatcher } from "svelte";

  export let fileLang: "en" | "es";

  const dispatch = createEventDispatcher();

  const switchLang = () => {
    changecodeWordsStore(fileLang);
    changeTranslation(fileLang);
    dispatch("closeModal");
  };

  const keepCurrent = () => {
    dispatch("closeModal");
  };

  $: langName = fileLang === "es"
    ? $translationStore.APP_SETTINGS_LANG_SPANISH
    : $translationStore.APP_SETTINGS_LANG_ENGLISH;
</script>

<b>{$translationStore.APP_FILE_LANGUAGE_MISMATCH.replace("%s", langName)}</b><br>
<span>{$translationStore.APP_FILE_LANGUAGE_MISMATCH_DESC}</span>

<div class="buttons">
  <button class="button alternative" on:click={keepCurrent}>
    {$translationStore.APP_FILE_LANGUAGE_MISMATCH_KEEP}
  </button>
  <button class="button" on:click={switchLang}>
    {$translationStore.APP_FILE_LANGUAGE_MISMATCH_SWITCH}
  </button>
</div>

<style lang="scss">
  @use "../../styles/variables.scss" as *;

  span {
    color: $linenumbers-foreground;
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }
</style>
