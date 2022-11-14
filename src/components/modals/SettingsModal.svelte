<script lang="ts">
   import { translationStore, changeTranslation, changecodeWordsStore } from "../../lib/stores";

   function selectTranslation(e) {
      changeTranslation(e.srcElement['value']);
   }

   function selectcodeWordsStore(e) {
      changecodeWordsStore(e.srcElement['value']);
   }
</script>

<div class="languages">
   <div>
      <div class="title">
         {$translationStore.APP_SETTINGS_SOFTWARE}
      </div>
      <div class="options">
         <div>
            <input type="radio" id="app-english" value="en" on:input={selectTranslation}>
            <label for="app-english">{$translationStore.APP_SETTINGS_LANG_ENGLISH}</label>
         </div>
         <div>
            <input type="radio" id="app-spanish" value="es" on:input={selectTranslation}>
            <label for="app-spanish">{$translationStore.APP_SETTINGS_LANG_SPANISH}</label>
         </div>
      </div>
   </div>
   <div>
      <div class="title">
         {$translationStore.APP_SETTINGS_PSEUDOCODE}
      </div>
      <div class="options">
         <div>
            <input type="radio" id="words-english" value="en" on:input={selectcodeWordsStore}>
            <label for="words-english">{$translationStore.APP_SETTINGS_LANG_ENGLISH}</label>
         </div>
         <div>
            <input type="radio" id="words-spanish" value="es" on:input={selectcodeWordsStore}>
            <label for="words-spanish">{$translationStore.APP_SETTINGS_LANG_SPANISH}</label>
         </div>
      </div>
   </div>
</div>

<style lang="scss">
   .languages {
      display: flex;
      justify-content: space-around;

      .title {
         margin-bottom: 1rem;
      }
   }
</style>