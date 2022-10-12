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
         
         dispatch('message', {
            text: capturedMessage
         });
      }
   };

   $: if (!activateInput) {
      capturedMessage = '';
      capturedInput = 0;
   }

</script>
<div id="output-content">
   {@html content}
   <span id="cursor">{@html "&nbsp;".repeat(capturedInput)}{cursor}</span>
</div>
<style lang="scss">
   #output-content {
      padding: 1rem;
      color: white;
   }

   #cursor {
      position: absolute;
      left: 0.7rem;
      animation: cursor-animation 1s infinite;
   }

   @keyframes cursor-animation {
      0% {
         opacity: 1;
      }
      50% {
         opacity: 0;
      }
   } 
</style>