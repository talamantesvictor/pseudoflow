<script lang="ts">
   import Topbar from "./components/Topbar.svelte";
   import Editor from "./components/Editor.svelte";
   import { getSyntaxTokens, getSyntaxTree } from "./lib/code";
   
   let isRunning: boolean = false;
   let pseudocode: string;
   let lastPseudocode: string;
   let syntaxTree: object;

   function runCode(e) {
      isRunning = e.detail;
      if (isRunning) {
         if (pseudocode !== lastPseudocode) {
            lastPseudocode = pseudocode;
            const tokens = getSyntaxTokens(pseudocode);
            syntaxTree = getSyntaxTree(tokens);
         }
         console.log((syntaxTree));
      }
   }
</script>

<Topbar on:runButtonClick={runCode} />
<div id="wrapper">
   <div id="flowchart-area"></div>
   <div id="running-area" class:active="{isRunning}"></div>
   <div id="text-area">
      <Editor bind:editorText={pseudocode} />
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
         flex-direction: column;
         width: 70%;
         background-color: $editor-background;
         height: calc(100vh - $topbar-height);
         overflow: hidden;
      }

      #running-area {
         width: 70%;
         height: calc(100% - $topbar-height);
         background-color: $flowchart-background;
         color: white;
         position: absolute;
         left: 0;
         transform: translateX(100%);
         transition: transform 0.2s;
         z-index: 2;

         &.active {
            transform: translateX(0%);
         }
      }

      #flowchart-area {
         width: 30%;
         height: calc(100% - $topbar-height);
         background-color: $flowchart-background;
         color: white;
         border-left: 1px solid $editor-background;
         position: absolute;
         right: 0;
         z-index: 3;
      }
   }
</style>