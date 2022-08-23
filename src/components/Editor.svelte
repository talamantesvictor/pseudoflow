<script lang="ts">
   import { onMount } from "svelte";

   let editorHeight: number;
   $: drawLineNumbers(editorHeight / 24); // scss variable $line-height = 24

   function getCaretCharacterOffsetWithin(element) {
      const win = element.ownerDocument.defaultView;
      let caretOffset = 0;
      let sel;
      if (typeof win.getSelection != "undefined") {
         sel = win.getSelection();
         if (sel.rangeCount > 0) {
            let range = win.getSelection().getRangeAt(0);
            let preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
         }
      }
      return caretOffset;
   }
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
         let selection = document.getSelection();
         let range = selection.getRangeAt(0);
         let tabNodeValue = "\t";
         let tabNode = document.createTextNode(tabNodeValue);
         range.insertNode(tabNode);
         range.setStartAfter(tabNode);
         range.setEndAfter(tabNode);

      } else if (e.key === "Enter") {
         e.preventDefault();
         let selection = document.getSelection();
         let range = selection.getRangeAt(0);
         let tabNodeValue = "\n";
         let element = document.getElementById('editor-editable-area');
         let caretPosition = getCaretCharacterOffsetWithin(element);
         let substr = element.textContent.slice(0, caretPosition);

         for (let i = substr.length - 1; i >= 0; i--) {
            if (substr[i] === '\n') 
               break;
            else if (substr[i] === '\t') {
               tabNodeValue += '\t'
            }
         }
         
         let tabNode = document.createTextNode(tabNodeValue);
         range.insertNode(tabNode);
         range.setStartAfter(tabNode);
         range.setEndAfter(tabNode);
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
