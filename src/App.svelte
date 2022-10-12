<script lang="ts">
   import type * as atype from "./lib/analyzers/atypes"
   import Topbar from "./components/Topbar.svelte";
   import Editor from "./components/Editor.svelte";
   import Output from "./components/Output.svelte";
   import { lexer } from "./lib/analyzers/lexer";
   import { parser } from "./lib/analyzers/parser";
   import { intepretTreeNode } from "./lib/code/interpreter"
   
   let isRunning: boolean = false;
   let activateOutputInput: boolean = false;
   let pseudocode: string;
   let lastPseudocode: string;
   let syntaxTree: object;
   let runningSentences: atype.SentencesNode[];
   let outputText: string;

   window.onkeydown = function (event) {
      if (event.code === 'Escape') {
         if (isRunning) {
            activateOutputInput = false;
            isRunning = false;
         }
      }
   }

   function startProgram() {
      outputText = "<div class=\"hl-comments\">Program started ***</div>";
   }

   function endProgram() {
      outputText += "<div class=\"hl-comments\">Program end ***</div>";
   }

   function readSentences() {
      while (runningSentences.length) {
         const sentence = runningSentences.shift();
         if (sentence.name === 'ReadNode') {
            activateOutputInput = true;
            break;
         }
         else if(!activateOutputInput) {
            const newNode = intepretTreeNode(sentence);
            outputText += newNode!.print;
         }
      }

      if(!activateOutputInput) {
         endProgram();
      }
   }

   function runCode(e) {
      isRunning = e.detail;
      activateOutputInput = false;
      
      if (isRunning) {
         if (pseudocode !== lastPseudocode) {
            lastPseudocode = pseudocode;
            const tokens = lexer(pseudocode);
            syntaxTree = parser(tokens);
         }
         runningSentences = [...syntaxTree['body']];
         startProgram();
         readSentences();
      }
   }

   function outputCapturedMessage(e) {
      activateOutputInput = false;
      const readSentenceIndex = syntaxTree['body'].length - runningSentences.length - 1;
      runningSentences.unshift({ 
         name: 'AssignmentNode', 
         identifier: syntaxTree['body'][readSentenceIndex].identifier.value, 
         value: { name: 'StringNode', value:  e.detail.text as string } 
      });
      outputText += "<span class=\"hl-read\" style=\"opacity: 0.5\">" + e.detail.text.replaceAll(' ', '&nbsp;') + "</span><br>";
      readSentences();
   }
</script>

<Topbar on:runButtonClick={runCode} bind:isRunning={isRunning} />
<div id="wrapper">
   <div id="flowchart-area"></div>
   <div id="output-area" class:active="{isRunning}">
      <Output content="{outputText}" activateInput="{activateOutputInput}" on:message={outputCapturedMessage} />
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