<script lang="ts">
   import { translationStore, changeTranslation, changecodeWordsStore, codeWordLang, translationLang } from "../../lib/stores";

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
            <input type="radio" id="app-english" name="app-language" value="en" on:input={selectTranslation} checked="{translationLang === 'en'}">
            <label for="app-english">{$translationStore.APP_SETTINGS_LANG_ENGLISH}</label>
         </div>
         <div>
            <input type="radio" id="app-spanish" name="app-language" value="es" on:input={selectTranslation} checked="{translationLang === 'es'}">
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
            <input type="radio" id="words-english" name="words-language" value="en" on:input={selectcodeWordsStore} checked="{codeWordLang === 'en'}">
            <label for="words-english">{$translationStore.APP_SETTINGS_LANG_ENGLISH}</label>
         </div>
         <div>
            <input type="radio" id="words-spanish" name="words-language" value="es" on:input={selectcodeWordsStore} checked="{codeWordLang === 'es'}">
            <label for="words-spanish">{$translationStore.APP_SETTINGS_LANG_SPANISH}</label>
         </div>
      </div>
   </div>
</div>

<style lang="scss">
   .languages {
      display: flex;

      div:first-child {
         margin-right: 1.5rem;
      }

      .title {
         margin-bottom: 1rem;
      }
   }
</style>