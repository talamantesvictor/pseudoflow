<script lang="ts">
   import { onMount } from "svelte";
   import codeWords from "../i18n/code/en.json"

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
   function changeController(e) {

      const editorElement = document.getElementById("editor-editable-area");
      let innerHTML = editorElement.innerHTML.toString();
      let tabsArray = [];

      // Tokenize ***
      // let str = editorElement.innerText;
      // let regex = /[^\s]+/g;
      // let tokens = str.match(regex);

      for (let index = 0; index < innerHTML.length; index++) {
         if (innerHTML[index] === '\t') {
            const sub = innerHTML.substring(0, index);
            const indexLastLineBreak = sub.lastIndexOf('<br>');
            const rowStart = indexLastLineBreak >= 0? indexLastLineBreak + 4 : 0;
            const rowString = sub.substring(rowStart);
            let calculatedPosition = 0;

            for (let rowCharIndex = 0; rowCharIndex < rowString.length; rowCharIndex++) {
               if (rowString[rowCharIndex] == '\t') {
                  calculatedPosition += 4 - (calculatedPosition % 4);
               }
               else {
                  calculatedPosition++;
               }
            }
            tabsArray.push(4 - (calculatedPosition % 4));
         }
      }

      tabsArray.forEach(spaces => {
         const spacesString = '&nbsp;'.repeat(spaces);
         innerHTML = innerHTML.replace(/\t/, spacesString);
      });

      innerHTML = innerHTML.replace(/\s/g, "&nbsp;");

      for (const [key, value] of Object.entries(codeWords)) {
         innerHTML = innerHTML.replace(new RegExp(`\\b${value}\\b`, "g"), '<span class="hl-'+value+'">'+value+'</span>');
      };

      document.getElementById("editor-colored-area").innerHTML = innerHTML;
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
            for (let i = 0; i < nodeString.length; i++) {
               if (nodeString[i] === '\t') {
                  tabsToInsert += '\t'
               }
               else {
                  break;
               }
            }
            if (tabsToInsert.length) {
               document.execCommand("InsertHTML", false, tabsToInsert);
            }
         }
      }
      else if (e.key === "Escape") {
         const range = window.getSelection().getRangeAt(0);
         range.setStart( range.endContainer, range.endOffset );
      }
   }
   function focusOnEditableArea() {
      document.getElementById("editor-editable-area").focus();
   }

   onMount(() => {
      focusOnEditableArea();
   });
</script>

<div class="commands-area">
   <ul>
      <li>Print</li>
      <li>Read</li>
      <li>If</li>
      <li>Else</li>
      <li>For</li>
      <li>While</li>
      <li>Do-While</li>
   </ul>
</div>
<div class="editor-area">
   <div class="numbers">
      <div class="line-numbers" />
   </div>
   <div class="editor" on:click={focusOnEditableArea}>
      <div bind:clientHeight={editorHeight}>
         <div
            id="editor-editable-area"
            contenteditable="true"
            spellcheck="false"
            on:input="{changeController}"
            on:keydown="{keyDownController}"
         />
         <div id="editor-colored-area"></div>
      </div>
   </div>
</div>

<style lang="scss">
   @import "../styles/variables.scss";

   .commands-area {
      display: flex;
      width: 100%;
      background-color: $editor-background;
      z-index: 1;
      
      ul {
         width: calc(100% - 1.6rem);
         border-radius: 0.8rem;
         background-color: #1C1F2D;
         list-style-type:none;
         margin: 0.8rem auto;
         padding: 0;
         li {
            color: #878992;
            display: inline-block;
            padding: 0.3rem 0.9rem;
            cursor: pointer;

            &:hover {
               color: $accent-color;
            }
         }
      }
   }

   .editor-area {
      display: flex;
      overflow: scroll;
   }

   .numbers {
      padding: 0 1rem 1rem 0.5rem;
      .line-numbers {
         color: $linenumbers-foreground;
         background-color: $linenumbers-background;
         min-width: 36px;
         text-align: right;
      }
   }

   .editor {
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
</style>
