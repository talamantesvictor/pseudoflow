<script lang="ts">
   import { codeWordStore, translationStore } from "../lib/stores";
   export let command: object = {};

   function declareCmd(e) {
      e.preventDefault();
      command = {
         template: $codeWordStore.CODE_VAR + ' xyz',
         timestamp: Date.now()
      }
   }
   function printCmd(e) {
      e.preventDefault();
      command = {
         template: $codeWordStore.CODE_PRINT + ' "' + $translationStore.APP_PLACEHOLDER_PRINT + '"',
         timestamp: Date.now()
      }
   }
   function readCmd(e) {
      e.preventDefault();
      command = {
         template: $codeWordStore.CODE_READ + ' xyz',
         timestamp: Date.now()
      }
   }
   function ifCmd(e) {
      e.preventDefault();
      command = {
         template: $codeWordStore.CODE_IF + ' (xyz == 1)\n' + $codeWordStore.CODE_ELSE + '\n' + $codeWordStore.CODE_ENDIF,
         timestamp: Date.now()
      }
   }
   function switchCmd(e) {
      e.preventDefault();
      command = {
         template: $codeWordStore.CODE_SWITCH + ' (xyz)\n' + $codeWordStore.CODE_CASE + ' 1:\n' + $codeWordStore.CODE_ENDCASE + '\n' + $codeWordStore.CODE_CASE + ' 2:\n' + $codeWordStore.CODE_ENDCASE + '\n' + $codeWordStore.CODE_ENDSWITCH,
         timestamp: Date.now()
      }
   }
   function forCmd(e) {
      e.preventDefault();
      command = {
         template: $codeWordStore.CODE_REPEAT + ' (' + $codeWordStore.CODE_REPEATDECLARE + ' xyz = 1 ' + $codeWordStore.CODE_REPEATTO + ' 10 ' + $codeWordStore.CODE_REPEATSTEP + ' 1)\n\n' + $codeWordStore.CODE_ENDREPEAT,
         timestamp: Date.now()
      }
   }
   function whileCmd(e) {
      e.preventDefault();
      command = {
         template: $codeWordStore.CODE_WHILE + ' (xyz > 0)\n\n' + $codeWordStore.CODE_ENDWHILE,
         timestamp: Date.now()
      }
   }
   function dowhileCmd(e) {
      e.preventDefault();
      command = {
         template: $codeWordStore.CODE_DOWHILE + ' (xyz > 0)\n\n' + $codeWordStore.CODE_ENDDOWHILE,
         timestamp: Date.now()
      }
   }
</script>


<div class="commands-area">
   <ul>
      <li on:mousedown="{declareCmd}">{$translationStore.APP_CMD_VAR}</li>
      <li on:mousedown="{printCmd}">{$translationStore.APP_CMD_PRINT}</li>
      <li on:mousedown="{readCmd}">{$translationStore.APP_CMD_READ}</li>
      <li on:mousedown="{ifCmd}">{$translationStore.APP_CMD_IF}</li>
      <li on:mousedown="{switchCmd}">{$translationStore.APP_CMD_SWITCH}</li>
      <li on:mousedown="{forCmd}">{$translationStore.APP_CMD_FOR}</li>
      <li on:mousedown="{whileCmd}">{$translationStore.APP_CMD_WHILE}</li>
      <li on:mousedown="{dowhileCmd}">{$translationStore.APP_CMD_DOWHILE}</li>
   </ul>
</div>


<style lang="scss">
   @import "../styles/variables.scss";

   .commands-area {
      width: 100%;
      background-color: $editor-background;
      z-index: 1;
      display: flex;
      
      ul {
         width: calc(100% - 1.6rem);
         border-radius: 0.8rem;
         background-color: #1C1F2D;
         list-style-type: none;
         margin: 0.8rem auto;
         padding: 0;
         display: none;

         li {
            color: rgba(255, 255, 255, 0.5);
            display: inline-block;
            padding: 0.3rem 0.9rem;
            cursor: pointer;

            &:hover {
               color: $accent-color;
            }
         }

         @media screen and (min-width: $breakpoint) {
            display: block;
         }
      }
   }
</style>