<script lang="ts">
   import Commands from "./Commands.svelte";
   import {
      getLineNumbers,
      insertTab,
      insertTemplate,
      insertLineBreak,
      unselectText,
      getActiveRowNumber,
   } from "../lib/editor";
   import { beautifier } from "../lib/code/beautifier";
   import { codeWordStore } from "../lib/stores";
   import { onMount } from "svelte";

   export let editorText: string = "";
   let editorDynamicArea: HTMLElement;
   let editorElement: HTMLElement;
   let coloredElement: HTMLElement;
   let numbersArea: HTMLElement;
   let numbersElement: HTMLElement;
   let activeRowNumber: number;
   let lastRowNumber: number;
   let commandToInsert: any;
   let lastInsertedCommand: any;

   $: {
      if (numbersElement) {
         // Redraw row numbers when editorHeight changes.
         // The defined line-height is 24.
         numbersElement.innerHTML = getLineNumbers(coloredElement.clientHeight / 24);
      }
   }

   $: {
      if (
         commandToInsert?.template &&
         lastInsertedCommand !== commandToInsert
      ) {
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
         setTimeout(() => {
            beautifyCode();
         });
      }
   }

   $: {
      if (editorElement) {
         if (editorElement.innerText !== editorText) {
            editorElement.innerText = editorText;
            beautifyCode();
         }
      }
   }

   function beautifyCode() {
      lastRowNumber = activeRowNumber;
      activeRowNumber = getActiveRowNumber(
         window.getSelection(),
         editorElement
      );
      coloredElement.innerHTML = beautifier(
         editorElement.innerText,
         $codeWordStore,
         activeRowNumber
      );
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
            var isChromium = !!window.CSS && window.CSS.supports && window.CSS.supports("(-webkit-appearance:none)");
            if (isChromium) {
               editorDynamicArea.scrollTop += 24;
               editorDynamicArea.scrollLeft = 0;
            }
            break;
         case "Escape":
            unselectText(window.getSelection());
            break;
         default:
            break;
      }
   }

   function keyUpController(e) {
      if (
         e.key === "Escape" ||
         e.key === "Enter" ||
         e.key === "ArrowUp" ||
         e.key === "ArrowDown" ||
         e.key === "ArrowRight" ||
         e.key === "ArrowLeft" ||
         (e.ctrlKey && e.key === "a")
      ) {
         beautifyCode();
      }
   }

   function mouseEvent() {
      activeRowNumber = getActiveRowNumber(
         window.getSelection(),
         editorElement
      );
      if (activeRowNumber !== lastRowNumber) {
         beautifyCode();
      }
   }

   function focusOnEditableArea() {
      editorElement.focus();
      beautifyCode();
   }

   onMount(() => {
      editorDynamicArea = document.querySelector("#editor-dynamic-area");
      editorElement = document.querySelector("#editor-editable-area");
      coloredElement = document.querySelector("#editor-colored-area");
      numbersArea = document.querySelector(".numbers-area");
      numbersElement = document.querySelector(".line-numbers");
      focusOnEditableArea();
   });
</script>

<Commands bind:command={commandToInsert} />
<div class="editor-area" on:click={focusOnEditableArea}>
   <div class="numbers-area">
      <div class="line-numbers" />
   </div>
   <div id="editor-dynamic-area" on:scroll={numbersArea.scrollTop = this.scrollTop}>
      <div id="editor-colored-area" />
      <div
         id="editor-editable-area"
         contenteditable="true"
         spellcheck="false"
         on:input={beautifyCode}
         on:keydown={keyDownController}
         on:keyup={keyUpController}
         on:mousemove={mouseEvent}
         on:blur={beautifyCode}
      />
   </div>
</div>

<style lang="scss">
   @import "../styles/variables.scss";

   .editor-area {
      position: relative;
      display: flex;
      flex-grow: 1;
      font-size: 16px;
      tab-size: 4;
      overflow: hidden;

      &::selection,
      ::-moz-selection {
         background: $editor-selection;
      }

      #editor-dynamic-area {
         width: 100%;
         height: 100%;
         position: relative;
         left: 0;
         overflow: auto;
      }

      #editor-colored-area {
         min-width: 100%;
         min-height: 24px;
         position: absolute;
         pointer-events: none;
         white-space: pre;
         color: white;
      }

      #editor-editable-area {
         width: 100%;
         position: absolute;
         top: 0;
         outline: 0px solid transparent;
         pointer-events: all;
         white-space: pre;
         color: transparent;
         caret-color: white;
      }
   }

   .numbers-area {
      pointer-events: none;
      overflow: hidden;

      .line-numbers {
         color: $linenumbers-foreground;
         min-width: 36px;
         text-align: right;
         padding-right: 20px;

         div {
            border-top: 1px solid transparent;
            border-bottom: 1px solid transparent;
            height: 22px;
            display: flex;
            align-items: center;
         }
      }
   }
</style>
