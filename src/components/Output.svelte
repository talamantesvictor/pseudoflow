<script lang="ts">
   import { createEventDispatcher } from 'svelte';
   export let content: string;
   export let activateInput: boolean;
   const dispatch = createEventDispatcher();
   const cursor = '|';
   let capturedMessage: string = '';
   let capturedInput: number = 0;

   document.onkeydown = function (event) {
      if (activateInput) {
         if (event.code.indexOf('Key') == 0 || event.code.indexOf('Digit') == 0) {
            capturedMessage = capturedMessage.slice(0, capturedInput) + event.key + capturedMessage.slice(capturedInput);
            capturedInput++;
         }
         else if (event.code === 'Space') {
            capturedMessage = capturedMessage.slice(0, capturedInput) + ' ' + capturedMessage.slice(capturedInput);
            capturedInput++;
         }
         else if (event.code === 'Backspace') {
            const newPrompt = capturedInput - 1 >=0 ? capturedInput - 1 : 0;
            capturedMessage = capturedMessage.slice(0, newPrompt) + capturedMessage.slice(capturedInput);
            capturedInput = newPrompt;
         }
         else if (event.code === 'Delete') {
            capturedMessage = capturedMessage.slice(0, capturedInput) + capturedMessage.slice(capturedInput + 1);
         }
         else if (event.code === 'ArrowLeft') {
            capturedInput = capturedInput - 1 >=0 ? capturedInput - 1 : 0;
         }
         else if (event.code === 'ArrowRight') {
            capturedInput = capturedInput + 1 < capturedMessage.length ? capturedInput + 1 : capturedMessage.length;
         }
         else if (event.code === 'Home' || event.code === 'ArrowUp') {
            capturedInput = 0;
         }
         else if (event.code === 'End' || event.code === 'ArrowDown') {
            capturedInput = capturedMessage.length;
         }
         else if (event.code === 'Enter') {
            activateInput = false;
            dispatch('message', {
               text: capturedMessage
            });
         }
         
      }
   };

   $: if (!activateInput) {
      capturedMessage = '';
      capturedInput = 0;
   }

</script>
<div id="output-content">
   {@html content}
   {#if activateInput}
      <div id="dynamic-wrapper">
         <div class="dynamic-content hl-read">
            {@html capturedMessage.replaceAll(' ', '&nbsp;') }
         </div>
         <div class="dynamic-content" id="cursor">
            {@html "&nbsp;".repeat(capturedInput)}{cursor}
         </div>
      </div>
   {/if}
</div>
<style lang="scss">
   #output-content {
      width: calc(100% - 2rem);
      min-height: calc(100% - 2rem);
      padding: 1rem;
      color: white;
      word-wrap: break-word;
      overflow-x: hidden;

      #dynamic-wrapper {
         position: relative;

         .dynamic-content {
            width: 100% !important;
            position: absolute;
            user-select: none;
         }

         #cursor {
            left: -.3rem;
            animation: cursor-animation 1s infinite;
         }
      }

   }

   @keyframes cursor-animation {
      0%  { opacity: 1; }
      50% { opacity: 0; }
   } 
</style>