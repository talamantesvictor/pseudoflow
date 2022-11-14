<script lang="ts">
   import { translations } from "../../lib/stores";
</script>

<div class="languages">
   <div>
      <div class="title">
         {$translations.APP_SETTINGS_SOFTWARE}
      </div>
      <div class="options">
         <div>
            <input type="radio" id="app-english" value="en">
            <label for="app-english">{$translations.APP_SETTINGS_LANG_ENGLISH}</label>
         </div>
         <div>
            <input type="radio" id="app-spanish" value="es">
            <label for="app-spanish">{$translations.APP_SETTINGS_LANG_SPANISH}</label>
         </div>
      </div>
   </div>
   <div>
      <div class="title">
         {$translations.APP_SETTINGS_PSEUDOCODE}
      </div>
      <div class="options">
         <div>
            <input type="radio" id="app-english">
            <label for="app-english">{$translations.APP_SETTINGS_LANG_ENGLISH}</label>
         </div>
         <div>
            <input type="radio" id="app-spanish">
            <label for="app-spanish">{$translations.APP_SETTINGS_LANG_SPANISH}</label>
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