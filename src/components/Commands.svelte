<script lang="ts">
   import { _reservedWords } from "../lib/stores";
   export let command: object = {};

   function printCmd(e) {
      e.preventDefault();
      command = {
         template: $_reservedWords.CODE_PRINT + ' "HELLO WORLD"',
         timestamp: Date.now()
      }
   }
   function readCmd(e) {
      e.preventDefault();
      command = {
         template: $_reservedWords.CODE_READ + ' variable_name',
         timestamp: Date.now()
      }
   }
   function ifCmd(e) {
      e.preventDefault();
      command = {
         template: $_reservedWords.CODE_IF + ' (xyz == 1)\n\n' + $_reservedWords.CODE_ENDIF,
         timestamp: Date.now()
      }
   }
   function switchCmd(e) {
      e.preventDefault();
      command = {
         template: $_reservedWords.CODE_SWITCH + ' (xyz)\n' + $_reservedWords.CODE_CASE + ' 1:\n' + $_reservedWords.CODE_ENDCASE + '\n' + $_reservedWords.CODE_CASE + ' 2:\n' + $_reservedWords.CODE_ENDCASE + '\n' + $_reservedWords.CODE_ENDSWITCH,
         timestamp: Date.now()
      }
   }
   function forCmd(e) {
      e.preventDefault();
      command = {
         template: $_reservedWords.CODE_FOR + ' (' + $_reservedWords.CODE_VAR + ' xyz = 1 ' + $_reservedWords.CODE_FORTO + ' 10 ' + $_reservedWords.CODE_FORSTEP + ' 1)\n\n' + $_reservedWords.CODE_ENDFOR,
         timestamp: Date.now()
      }
   }
   function whileCmd(e) {
      e.preventDefault();
      command = {
         template: $_reservedWords.CODE_WHILE + ' (xyz > 0)\n\n' + $_reservedWords.CODE_ENDWHILE,
         timestamp: Date.now()
      }
   }
   function dowhileCmd(e) {
      e.preventDefault();
      command = {
         template: $_reservedWords.CODE_DOWHILE + ' (xyz > 0)\n\n' + $_reservedWords.CODE_ENDDOWHILE,
         timestamp: Date.now()
      }
   }
</script>


<div class="commands-area">
   <ul>
      <li on:mousedown="{printCmd}">Print</li>
      <li on:mousedown="{readCmd}">Read</li>
      <li on:mousedown="{ifCmd}">If</li>
      <li on:mousedown="{switchCmd}">Switch</li>
      <li on:mousedown="{forCmd}">For</li>
      <li on:mousedown="{whileCmd}">While</li>
      <li on:mousedown="{dowhileCmd}">Do-While</li>
   </ul>
</div>


<style lang="scss">
   @import "../styles/variables.scss";

   .commands-area {
      display: flex;
      width: 100%;
      background-color: $editor-background;
      z-index: 1;
      
      ul {
         width: calc(100% - 1.6rem);
         border-radius: 0.8rem;
         background-color: #1C1F2D;
         list-style-type:none;
         margin: 0.8rem auto;
         padding: 0;
         li {
            color: rgba(255, 255, 255, 0.5);
            display: inline-block;
            padding: 0.3rem 0.9rem;
            cursor: pointer;

            &:hover {
               color: $accent-color;
            }
         }
      }
   }
</style>