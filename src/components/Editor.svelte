<script lang="ts">
   import Commands from "./Commands.svelte";
   import reservedWords from "../i18n/code/en.json";
   import { getLineNumbers, getCodeHighlights, insertTab, insertLineBreak, unselectText } from "../lib/editor/helpers";
   import { onMount } from "svelte";

   let editorHeight: number;
   // Redraw line numbers when editorHeight changes.
   // The defined line-height is 24.
   $: { 
      const numbersElement : Element = document.getElementsByClassName("line-numbers")[0];
      if (numbersElement) {
         numbersElement.innerHTML = getLineNumbers(editorHeight / 24);
      }
   }

   function beautifyController(e) {
      const editorElement = document.getElementById("editor-editable-area");
      const coloredElement = document.getElementById("editor-colored-area");
      coloredElement.innerHTML = getCodeHighlights(editorElement.innerHTML, reservedWords);
   }

   function keyDownController(e) {
      switch (e.key) {
         case "Tab":
            e.preventDefault();
            insertTab();
            break;
         case "Enter":
            e.preventDefault();
            insertLineBreak(window.getSelection());
            break;
         case "Escape":
            unselectText(window.getSelection());
            break;
         default:
            break;
      }
   }

   function focusOnEditableArea() {
      document.getElementById("editor-editable-area").focus();
   }

   onMount(() => {
      focusOnEditableArea();
   });
</script>

<Commands />
<div class="editor-wrapper">
   <div class="numbers-area">
      <div class="line-numbers" />
   </div>
   <div class="editor-area" on:click={focusOnEditableArea}>
      <div bind:clientHeight={editorHeight}>
         <div
            id="editor-editable-area"
            contenteditable="true"
            spellcheck="false"
            on:input="{beautifyController}"
            on:keydown="{keyDownController}"
         />
         <div id="editor-colored-area"></div>
      </div>
   </div>
</div>

<style lang="scss">
   @import "../styles/variables.scss";

   .editor-wrapper {
      display: flex;
      overflow: scroll;

      .numbers-area {
         padding: 0 1rem 1rem 0.5rem;
         .line-numbers {
            color: $linenumbers-foreground;
            background-color: $linenumbers-background;
            min-width: 36px;
            text-align: right;
         }
      }
   
      .editor-area {
         width: 100%;
         flex-grow: 1;
         min-height: calc(100% - 2rem);
         padding: 0 1rem 1rem 0rem;
         position: relative;
         font-size: 16px;
         tab-size: 4;
   
         &::selection, ::-moz-selection {
            background: $editor-selection;
         }
         
         #editor-editable-area {
            outline: 0px solid transparent;
            pointer-events: all;
            white-space: pre;
            color: transparent;
            caret-color: white;         
         }
   
         #editor-colored-area {
            position: absolute;
            top: 0;
            pointer-events: none;
            white-space: pre;
            color: white;
         }
      }
   }
</style>
