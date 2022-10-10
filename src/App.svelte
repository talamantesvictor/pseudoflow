<script lang="ts">
   import type * as atype from "./lib/analyzers/atypes"
   import Topbar from "./components/Topbar.svelte";
   import Editor from "./components/Editor.svelte";
   import Output from "./components/Output.svelte";
   import { tokenize } from "./lib/analyzers/lexer";
   import { parser } from "./lib/analyzers/parser";
   import { treeNodeInterpreter } from "./lib/code/interpreter"
   
   let isRunning: boolean = false;
   let pseudocode: string;
   let lastPseudocode: string;
   let syntaxTree: object;
   let outputText: string;

   function runCode(e) {
      isRunning = e.detail;
      if (isRunning) {
         if (pseudocode !== lastPseudocode) {
            lastPseudocode = pseudocode;
            const tokens = tokenize(pseudocode);
            syntaxTree = parser(tokens);
         }

         outputText = "Program started ***<br>";

         for (const [key, value] of Object.entries(syntaxTree['body'])) {
            let newNode = treeNodeInterpreter(value as atype.SentencesNode);
            outputText += newNode.print;
         }

         outputText += "Program finished ***";
      }
   }
</script>

<Topbar on:runButtonClick={runCode} />
<div id="wrapper">
   <div id="flowchart-area"></div>
   <div id="output-area" class:active="{isRunning}">
      <Output content="{outputText}" />
   </div>
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

      #output-area {
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