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
        themeStore,
        changeTheme } from "../../lib/stores";
   import draculaThumb from "../../../static/themes/dracula.webp";
   import monokaiThumb from "../../../static/themes/monokai.webp";
   import lightThumb from "../../../static/themes/light.webp";

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

    function selectTheme(id: string) {
       changeTheme(id);
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
    <div class="themeOptions">
       <div class="theme-card" class:active={$themeStore === 'dracula'} role="button" tabindex="0" on:click={() => selectTheme('dracula')} on:keydown={() => selectTheme('dracula')}>
          <img src={draculaThumb} alt="Dracula" />
          <span>{$translationStore.APP_SETTINGS_THEME_DRACULA}</span>
       </div>
       <div class="theme-card" class:active={$themeStore === 'monokai'} role="button" tabindex="0" on:click={() => selectTheme('monokai')} on:keydown={() => selectTheme('monokai')}>
          <img src={monokaiThumb} alt="Monokai Pro" />
          <span>{$translationStore.APP_SETTINGS_THEME_MONOKAI}</span>
       </div>
       <div class="theme-card" class:active={$themeStore === 'github-light'} role="button" tabindex="0" on:click={() => selectTheme('github-light')} on:keydown={() => selectTheme('github-light')}>
          <img src={lightThumb} alt="GitHub Light" />
          <span>{$translationStore.APP_SETTINGS_THEME_GITHUB_LIGHT}</span>
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
      margin-top: 1.5rem;

      .title {
         margin-bottom: 1rem;
      }
   }

   .themeOptions {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;

      .theme-card {
         display: flex;
         flex-direction: column;
         align-items: center;
         cursor: pointer;
         border: 2px solid $border-color;
         border-radius: 0.5rem;
         padding: 0.5rem;
         transition: border-color 0.2s;

         &:hover {
            border-color: $accent-color;
         }

         &.active {
            border-color: $accent-color;
         }

         img {
            width: 160px;
            height: 160px;
            object-fit: cover;
            border-radius: 0.25rem;
         }

         span {
            margin-top: 0.4rem;
            font-size: 0.8rem;
            color: $linenumbers-foreground;
         }
      }

      @media screen and (max-width: calc($breakpoint - 1px)) {
         flex-direction: column;
      }
   }
</style>