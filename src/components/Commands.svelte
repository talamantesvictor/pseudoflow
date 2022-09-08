<script lang="ts">
   export let command: object = {};

   function printCmd() {
      command = {
         template: 'print "EJEMPLO DE TEXTO A IMPRIMIR EN CONSOLA"',
         timestamp: Date.now()
      }
   }
   function readCmd() {
      command = {
         template: 'read variable_name ',
         timestamp: Date.now()
      }
   }
   function ifCmd() {
      command = {
         template: 'if xyz == 1 then\n\nendif',
         timestamp: Date.now()
      }
   }
   function switchCmd() {
      command = {
         template: 'switch xyz\ncase 1:\nendcase\ncase 2:\nendcase\nendswitch',
         timestamp: Date.now()
      }
   }
   function forCmd() {
      command = {
         template: 'for xyz=1 to 10 step 1\n\nendfor',
         timestamp: Date.now()
      }
   }
   function whileCmd() {
      command = {
         template: 'while xyz>0\n\nendwhile',
         timestamp: Date.now()
      }
   }
   function dowhileCmd() {
      command = {
         template: 'dowhile xyz>0\n\nenddowhile',
         timestamp: Date.now()
      }
   }
</script>

<div class="commands-area">
   <ul>
      <li on:click="{printCmd}">Print</li>
      <li on:click="{readCmd}">Read</li>
      <li on:click="{ifCmd}">If</li>
      <li on:click="{switchCmd}">Switch</li>
      <li on:click="{forCmd}">For</li>
      <li on:click="{whileCmd}">While</li>
      <li on:click="{dowhileCmd}">Do-While</li>
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
            color: #878992;
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