<script lang="ts">
   import { translationStore } from "../lib/stores";
   import { createEventDispatcher } from "svelte";
   import { scale, fade } from "svelte/transition";
   import { quintOut } from "svelte/easing";
   import closeButton from '../../static/images/close_button.svg';

   const topbarDispatcher = createEventDispatcher();
   export let title: string = 'Modal';
   export let component: any;
   export let saveDialog: boolean;

   const closeModal = () => {
      topbarDispatcher("closeModal");
   };

   const closeAndNew = () => {
      topbarDispatcher("closeAndNew");
   };

   const saveAndClose = () => {
      topbarDispatcher("saveAndClose");
   };

</script>

<div class="backdrop" on:click={closeModal} transition:fade={{ duration: 150 }}></div>
<div class="modal" transition:scale={{ duration: 300, easing: quintOut }}>
   <div class="header">
      <div class="title">
         {title}
      </div>
      <div class="close">
         <img src="{closeButton}" alt="Close Button" on:click={closeModal} />
      </div>
   </div>
   <div class="content">
      <div class="inner-content">
         <svelte:component this={component} />
      </div>
      {#if saveDialog}
      <div class="inner-options">
         <span class="link" on:click={closeModal}>{$translationStore.APP_SAVE_CANCEL_BUTTON}</span>
         <div class="right">
            <button class="button alternative" on:click={closeAndNew}>{$translationStore.APP_SAVE_NO_BUTTON}</button>
            <button class="button" on:click={saveAndClose}>{$translationStore.APP_SAVE_YES_BUTTON}</button>
         </div>
      </div>
      {/if}
   </div>
</div>

<style lang="scss">
   @import "../styles/variables.scss";

   .backdrop {
      width: 100vw;
      height: 100vh;
      position: absolute;
      top: 0;
      left: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 10;
   }

   .modal {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      max-width: 700px;
      max-height: 500px;
      width: 90%;
      height: auto;
      background: #282A36;
      color: white;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      z-index: 10;

      .header {
         width: calc(100% - 1.6rem);
         height: 3rem;
         background: #424453;
         display: flex;
         justify-content: space-between;
         align-items: center;
         padding: 0 1rem;

         .close {
            height: 2rem;
            cursor: pointer;

            img {
               height: 100%;
            }
         }
      }

      .content {
         width: 100%;
         height: 100%;
         overflow-y: auto;
         
         .inner-content {
            padding: 1rem 2rem;
            overflow: hidden;

            @media screen and (min-width: $breakpoint) {
               padding: 2rem 4rem;
            }
         }

         .inner-options {
            margin: 0 1rem 1rem 1rem;
            display: flex;
            justify-content: space-between;

            .right {
               display: flex;

               button {
                  margin-left: 1rem;
               }
            }
         }
      }
   }
</style>