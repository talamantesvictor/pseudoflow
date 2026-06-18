<script lang="ts">
    import { 
       translationStore, 
       changeTranslation, 
       changecodeWordsStore, 
       codeWordLang, 
       translationLang, 
       changeFlowchartVisibility, 
       isFlowchartVisible,
       changeSyntaxErrors,
       changeSemanticErrors,
       syntaxErrorsEnabled,
       semanticErrorsEnabled,
       themeId,
       changeTheme } from "../../lib/stores";

    function selectTranslation(e: Event) {
      changeTranslation((e.srcElement as HTMLInputElement)['value']);
   }

   function selectcodeWordsStore(e: Event) {
      changecodeWordsStore((e.srcElement as HTMLInputElement)['value']);
   }

    function toggleFlowchart(e: Event) {
       changeFlowchartVisibility((e.target as HTMLInputElement)['checked']);
    }

    function toggleSyntaxErrors(e: Event) {
       changeSyntaxErrors((e.target as HTMLInputElement)['checked']);
    }

    function toggleSemanticErrors(e: Event) {
       changeSemanticErrors((e.target as HTMLInputElement)['checked']);
    }

    function selectTheme(e: Event) {
       changeTheme((e.srcElement as HTMLInputElement)['value']);
    }
</script>

<div class="languageSettings">
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
<div class="otherSettings">
   <div class="options">
      <div>
         <input type="checkbox" id="flowchart" on:input={toggleFlowchart} checked="{isFlowchartVisible}">
         <label for="flowchart">{$translationStore.APP_SETTINGS_OTHER_FLOWCHART}. 
            <span>{$translationStore.APP_SETTINGS_OTHER_FLOWCHART_INFO}</span>
         </label>
      </div>
      <div>
         <input type="checkbox" id="syntax-errors" on:input={toggleSyntaxErrors} checked="{syntaxErrorsEnabled}">
         <label for="syntax-errors">{$translationStore.APP_SETTINGS_OTHER_SYNTAX}</label>
      </div>
       <div>
          <input type="checkbox" id="semantic-errors" on:input={toggleSemanticErrors} checked="{semanticErrorsEnabled}">
          <label for="semantic-errors">{$translationStore.APP_SETTINGS_OTHER_SEMANTIC}</label>
       </div>
    </div>
</div>
<div class="otherSettings">
    <div class="title">
       {$translationStore.APP_SETTINGS_THEME}
    </div>
    <div class="options">
       <div>
          <input type="radio" id="theme-dracula" name="theme" value="dracula" on:input={selectTheme} checked="{themeId === 'dracula'}">
          <label for="theme-dracula">{$translationStore.APP_SETTINGS_THEME_DRACULA}</label>
       </div>
       <div>
          <input type="radio" id="theme-monokai" name="theme" value="monokai" on:input={selectTheme} checked="{themeId === 'monokai'}">
          <label for="theme-monokai">{$translationStore.APP_SETTINGS_THEME_MONOKAI}</label>
       </div>
       <div>
          <input type="radio" id="theme-github-light" name="theme" value="github-light" on:input={selectTheme} checked="{themeId === 'github-light'}">
          <label for="theme-github-light">{$translationStore.APP_SETTINGS_THEME_GITHUB_LIGHT}</label>
       </div>
    </div>
</div>

<style lang="scss">
   @use "../../styles/variables.scss" as *;

   .languageSettings {
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
      }
   }

   .options div {
      display: flex;
      align-items: center;
      margin-bottom: 0.8rem;      
   }

   .otherSettings {
      margin-top: 1rem;
   }
</style>