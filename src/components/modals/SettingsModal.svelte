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
            <label for="app-english">
               {$translationStore.APP_SETTINGS_LANG_ENGLISH}
            </label>
         </div>
         <div>
            <input type="radio" id="app-spanish" name="app-language" value="es" on:input={selectTranslation} checked="{translationLang === 'es'}">
            <label for="app-spanish">
               {$translationStore.APP_SETTINGS_LANG_SPANISH}
            </label>
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
   @import "../../styles/variables.scss";

   .languages {
      display: flex;
      justify-content: space-between;

      div:first-child {
         margin-right: 1.5rem;
      }
      .title {
         margin-bottom: 1rem;
      }

      @media screen and (max-width: calc($breakpoint - 1px)) {
         flex-direction: column;
         justify-content: left;
         
         div {
            margin-bottom: 1rem;
         }
      }
   }

   .options div {
      display: flex;
      align-items: center;
      margin-bottom: 0.8rem;

      label {
         cursor: pointer;
      }

      input[type="radio"] {
         -webkit-appearance: none;
         appearance: none;
         margin: 0;
         font: inherit;
         color: white;
         width: 1.3rem;
         height: 1.3rem;
         border: 2px solid $accent-color;
         border-radius: 50%;
         margin-right: 0.8rem;
         display: grid;
         place-content: center;
         cursor: pointer;

         &::before {
            content: url(../../../static/images/check_icon.svg);
            transform: scale(0);
         }

         &:checked {
            border-color: $alternative-color;
            &::before {
               transform: scale(0.4) translateY(0.2rem); 
            }
         }
      }
   }
</style>