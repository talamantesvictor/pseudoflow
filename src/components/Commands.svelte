<script lang="ts">
   export let command: object = {};

   function printCmd() {
      command = {
         template: 'print "EJEMPLO DE TEXTO A IMPRIMIR EN CONSOLA"',
         timestamp: Date.now()
      }
   }
</script>

<div class="commands-area">
   <ul>
      <li on:click="{printCmd}">Print</li>
      <li>Read</li>
      <li>If</li>
      <li>Switch</li>
      <li>For</li>
      <li>While</li>
      <li>Do-While</li>
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