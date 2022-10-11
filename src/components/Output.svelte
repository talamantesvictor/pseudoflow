<script lang="ts">
   import { createEventDispatcher } from 'svelte';
   export let content: string;
   export let isOpen: boolean;
   const dispatch = createEventDispatcher();
   let capturedMessage: string = '';
   let capturedPrompt: number = 0;

   document.onkeydown = function (event) {
      if (isOpen) {
         if (event.code.indexOf('Key') == 0 || event.code.indexOf('Digit') == 0) {
            capturedMessage = capturedMessage.slice(0, capturedPrompt) + event.key + capturedMessage.slice(capturedPrompt);
            capturedPrompt++;
         }
         else if (event.code === 'Space') {
            capturedMessage = capturedMessage.slice(0, capturedPrompt) + ' ' + capturedMessage.slice(capturedPrompt);
            capturedPrompt++;
         }
         else if (event.code === 'Backspace') {
            const newPrompt = capturedPrompt - 1 >=0 ? capturedPrompt - 1 : 0;
            capturedMessage = capturedMessage.slice(0, newPrompt) + capturedMessage.slice(capturedPrompt);
            capturedPrompt = newPrompt;
         }
         else if (event.code === 'Delete') {
            capturedMessage = capturedMessage.slice(0, capturedPrompt) + capturedMessage.slice(capturedPrompt + 1);
         }
         else if (event.code === 'ArrowLeft') {
            capturedPrompt = capturedPrompt - 1 >=0 ? capturedPrompt - 1 : 0;
         }
         else if (event.code === 'ArrowRight') {
            capturedPrompt = capturedPrompt + 1 < capturedMessage.length ? capturedPrompt + 1 : capturedMessage.length;
         }
         else if (event.code === 'Home' || event.code === 'ArrowUp') {
            capturedPrompt = 0;
         }
         else if (event.code === 'End' || event.code === 'ArrowDown') {
            capturedPrompt = capturedMessage.length;
         }
         
         dispatch('message', {
            text: capturedMessage
         });
      }
   };

   $: if (!isOpen) {
      capturedMessage = '';
   }

</script>
<div id="output-content">
   {@html content}
</div>
<style lang="scss">
   #output-content {
      padding: 1rem;
      color: white;
   }
</style>