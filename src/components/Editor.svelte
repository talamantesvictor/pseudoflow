<script lang="ts">
   import { onMount } from "svelte";

   let editorHeight: number;
   $: drawLineNumbers(editorHeight / 24); // scss variable $line-height = 24

   function drawLineNumbers(rows) {
      if (rows > 0) {
         let rowsHtml: string = "";
         for (let index = 0; index < rows; index++) {
            rowsHtml += index + 1 + "<br>";
         }
         document.getElementsByClassName("line-numbers")[0].innerHTML =
            rowsHtml;
      }
   }
   function keyDownController(e) {
      if (e.key === "Tab") {
         e.preventDefault();
         document.execCommand("InsertText", false, '\t');

      } 
      else if (e.key === "Enter") {
         e.preventDefault();
         
         let nodeString = window.getSelection().anchorNode.nodeValue;
         document.execCommand('InsertLineBreak');

         if (nodeString) {
            let tabsToInsert = '';
            for (let i = nodeString.length - 1; i >= 0; i--) {
               if (nodeString[i] === '\n') 
                  break;
               else if (nodeString[i] === '\t') {
                  tabsToInsert += '\t'
               }
            }
            if (tabsToInsert.length) {
               document.execCommand("InsertHTML", false, tabsToInsert);
            }
         }
      }
   }
   function focusOnEditableArea() {
      document.getElementById("editor-editable-area").focus();
   }

   onMount(() => {
      focusOnEditableArea();
   });
</script>

<div class="numbers-area">
   <div class="line-numbers" />
</div>
<div class="editor-area" on:click={focusOnEditableArea}>
   <div bind:clientHeight={editorHeight}>
      <div
         id="editor-editable-area"
         contenteditable="true"
         spellcheck="false"
         on:keydown={keyDownController}
      />
   </div>
</div>

<style lang="scss">
   @import "../styles/variables.scss";

   .numbers-area {
      padding: 1rem 1rem 1rem 0.5rem;
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
      color: white;
      padding: 1rem 1rem 1rem 0rem;

      [contenteditable] {
         outline: 0px solid transparent;
         pointer-events: all;
         white-space: pre-wrap;
      }
   }
</style>
