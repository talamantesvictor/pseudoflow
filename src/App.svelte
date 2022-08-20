<script lang="ts">
   import { onMount } from "svelte";
   import Topbar from "./components/Topbar.svelte";

   let editorHeight: number;

   $: drawLineNumbers(editorHeight / 24); // scss variable $line-height = 24

   function drawLineNumbers(rows) {
      if (rows > 0) {
         let rowsHtml: string = '';
         for (let index = 0; index < rows; index++) {
            rowsHtml += index + 1 + '<br>';
         }
         document.getElementsByClassName('line-numbers')[0].innerHTML = rowsHtml;
      }
   }

   function keyDownController(e) {
      if (e.key === "Tab") {
         e.preventDefault();
      }
   }

   function focusOnEditableArea() {
      document.getElementById('editor-editable-area').focus();
   }

   onMount(() => {
      focusOnEditableArea();
   });
</script>
<Topbar />
<div id="wrapper">
   <div id="flowchart-area"></div>
   <div id="text-area">
      <div class="numbers-area">
         <div class="line-numbers"></div>
      </div>
      <div class="editor-area" on:click="{focusOnEditableArea}">
         <div bind:clientHeight="{editorHeight}">
            <div id="editor-editable-area" contenteditable="true" spellcheck="false" on:keydown="{keyDownController}"></div>
         </div>
      </div>
   </div>
</div>
<style lang="scss">
   @import "./styles/variables.scss";

   #wrapper {
      height: calc(100% - $topbar-height);
      background: $editor-background;
      overflow: hidden;

      #text-area {
         display: flex;
         width: 70%;
         background-color: $editor-background;
         height: calc(100vh - $topbar-height);
         overflow: scroll;

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
            }
         }
      }

      #flowchart-area {
         width: 30%;
         height: calc(100% - $topbar-height);
         background-color: $flowchart-background;
         color: white;
         position: absolute;
         right: 0;
      }
   }
</style>