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
   function changeController(e) {
      // Tokenize ***
      let str = document.getElementById("editor-editable-area").innerText;
      let regex = /[^\s]+/g;
      let tokens = str.match(regex);
      console.log(tokens);

      const varWord = /var\b/g;
      const printWord = /print\b/g;
      const forWord = /for\b/g;

      let innerHTML = document.getElementById("editor-editable-area").innerHTML.toString();

      // tokens?.forEach(token => {
      //    innerHTML += '<span>' + token + '</span>';
      // });


      innerHTML = innerHTML.replace(varWord, '<span style="color: red;">var</span> ');
      innerHTML = innerHTML.replace(printWord, '<span style="color: yellow;">print</span> ');
      innerHTML = innerHTML.replace(forWord, '<span style="color: cyan;">for</span> ');
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
      background-color: #1C1F2D;
      position: fixed;
      width: inherit;
      z-index: 1;
      
      ul {
         list-style-type:none;
         margin: 0;
         padding: 0;
         li {
            color: #878992;
            display: inline-block;
            padding: 0.3rem 0.9rem;
            cursor: pointer;

            &:hover {
               color: white;
            }
         }
      }
   }

   .editor-area {
      display: flex;
      padding: 2rem 0;
      height: calc(100% - 4rem);
      overflow: scroll;
   }

   .numbers {
      padding: 1rem 1rem 1rem 0.5rem;
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
      color: white;
      padding: 1rem 1rem 1rem 0rem;
      position: relative;

      #editor-editable-area {
         outline: 0px solid transparent;
         pointer-events: all;
         white-space: pre-wrap;
         color: transparent;
         caret-color: white;
      }

      #editor-colored-area {
         position: absolute;
         top: 0;
         pointer-events: none;
      }
   }
</style>
