<script lang="ts">
   import Commands from "./Commands.svelte";
   import { getLineNumbers, insertTab, insertTemplate, insertLineBreak, unselectText, getCurrentLineNumber } from "../lib/editor";
   import { getBeautifiedCode } from "../lib/code/beautifier";
   import { _reservedWords } from "../lib/stores";
   import { onMount } from "svelte";

   export let editorText: String = '';
   let editorElement: HTMLElement;
   let coloredElement: HTMLElement;
   let numbersElement: Element;
   let editorHeight: number;
   let activeRowNumber: number;
   let lastRowNumber: number;
   let commandToInsert: any;
   let lastInsertedCommand: any;

   // Redraw line numbers when editorHeight changes.
   // The defined line-height is 24.
   $: { 
      if (numbersElement) {
         numbersElement.innerHTML = getLineNumbers(editorHeight / 24);
      }
   }

   $: {
      if (commandToInsert?.template && lastInsertedCommand !== commandToInsert) {
         lastInsertedCommand = commandToInsert;

         if (editorElement !== document.activeElement) {
            // If the editor area isn't focused, focus it
            focusOnEditableArea();
            // and set the caret at the end of the text
            window.getSelection().removeAllRanges();
            let newRange = document.createRange();
            newRange.selectNodeContents(editorElement);
            newRange.collapse(false);
            window.getSelection().addRange(newRange);
         }
         insertTemplate(commandToInsert.template);
      }
   }

   function beautifier() {
      lastRowNumber = activeRowNumber;
      activeRowNumber = getCurrentLineNumber(window.getSelection(), editorElement);
      coloredElement.innerHTML = getBeautifiedCode(editorElement.innerHTML, $_reservedWords, activeRowNumber);
      editorText = editorElement.innerText;
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

   function keyUpController(e) {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'ArrowLeft' || (e.ctrlKey && e.key === 'a')) {
         beautifier();
      }
   }

   function mouseEvent() {
      activeRowNumber = getCurrentLineNumber(window.getSelection(), editorElement);
      if (activeRowNumber !== lastRowNumber) {
         beautifier();
      }
   }

   function focusOnEditableArea() {
      editorElement.focus();
      beautifier();
   }

   onMount(() => {
      editorElement = document.getElementById("editor-editable-area");
      coloredElement = document.getElementById("editor-colored-area");
      numbersElement = document.getElementsByClassName("line-numbers")[0];
      focusOnEditableArea();
   });
</script>

<Commands bind:command={commandToInsert} />
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
            on:input="{beautifier}"
            on:keydown="{keyDownController}"
            on:keyup="{keyUpController}"
            on:mousemove="{mouseEvent}"
            on:blur="{beautifier}"
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
      flex-grow: 1;

      .numbers-area {
         padding: 0 1rem 1rem 0.5rem;
         -webkit-user-select: none; /* Safari */
         -moz-user-select: none;
         user-select: none;
         pointer-events: none;

         .line-numbers {
            color: $linenumbers-foreground;
            background-color: $linenumbers-background;
            min-width: 36px;
            text-align: right;
            
            div {
               border-top: 1px solid transparent;
               border-bottom: 1px solid transparent;
               height: 22px;
               display: flex;
               align-items: center;
            }
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
            min-width: 100%;
         }  
      }
   }
</style>
