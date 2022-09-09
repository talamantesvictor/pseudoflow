<script lang="ts">
   export let command: object = {};

   function printCmd(e) {
      e.preventDefault();
      command = {
         template: 'print "EJEMPLO DE TEXTO A IMPRIMIR EN CONSOLA"',
         timestamp: Date.now()
      }
   }
   function readCmd(e) {
      e.preventDefault();
      command = {
         template: 'read variable_name ',
         timestamp: Date.now()
      }
   }
   function ifCmd(e) {
      e.preventDefault();
      command = {
         template: 'if xyz == 1 then\n\nendif',
         timestamp: Date.now()
      }
   }
   function switchCmd(e) {
      e.preventDefault();
      command = {
         template: 'switch xyz\ncase 1:\nendcase\ncase 2:\nendcase\nendswitch',
         timestamp: Date.now()
      }
   }
   function forCmd(e) {
      e.preventDefault();
      command = {
         template: 'for xyz=1 to 10 steps 1\n\nendfor',
         timestamp: Date.now()
      }
   }
   function whileCmd(e) {
      e.preventDefault();
      command = {
         template: 'while xyz>0\n\nendwhile',
         timestamp: Date.now()
      }
   }
   function dowhileCmd(e) {
      e.preventDefault();
      command = {
         template: 'dowhile xyz>0\n\nenddowhile',
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