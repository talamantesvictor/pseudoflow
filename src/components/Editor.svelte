<script lang="ts">
   import Commands from "./Commands.svelte";
   import {
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
   let activeRowNumber: number;
   let lastRowNumber: number;
   let commandToInsert: any;
   let lastInsertedCommand: any;

   $: {
      if (
         commandToInsert?.template &&
         lastInsertedCommand !== commandToInsert
      ) {
         lastInsertedCommand = commandToInsert;

         if (editorElement !== document.activeElement) {
            focusOnEditableArea();
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
            setTimeout(() => {
               focusOnEditableArea();
            });
         }
      }
   }

   function beautifyCode() {
      lastRowNumber = activeRowNumber;
      activeRowNumber = getActiveRowNumber(
         window.getSelection(),
         editorElement
      );
      const text = editorElement.innerText;
      const lines = text.endsWith('\n') ? text.split('\n').length - 1 : text.split('\n').length;
      const highlighted = beautifier(text, $codeWordStore, activeRowNumber);
      let lineNum = 1;
      coloredElement.innerHTML = highlighted.replace(
         /(<div class="line[^"]*">)/g,
          (match) => match + '<span class="line-num">' + (lineNum++) + '</span>'
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
               editorDynamicArea.scrollTop += 22;
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
      focusOnEditableArea();
   });
</script>

<Commands bind:command={commandToInsert} />
<div class="editor-area" on:mouseup={focusOnEditableArea}>
   <div id="editor-dynamic-area">
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
   @use "../styles/variables.scss" as *;

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
         color: $flowchart-background;
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
         min-height: 22px;
         position: absolute;
         top: 0;
         pointer-events: none;
         white-space: pre;
         color: white;
      }

      #editor-editable-area {
         position: absolute;
         top: 0;
         left: 76px;
         right: 0;
         outline: 0px solid transparent;
         pointer-events: all;
         white-space: pre;
         line-height: 22px;
         color: transparent;
         caret-color: white;
      }
   }

   .line-num {
      display: inline-block;
      min-width: 36px;
      text-align: right;
      padding-right: 20px;
      color: $linenumbers-foreground;
      user-select: none;
   }
</style>
