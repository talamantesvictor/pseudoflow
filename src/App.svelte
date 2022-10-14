<script lang="ts">
   import type * as atype from "./lib/analyzers/atypes"
   import Topbar from "./components/Topbar.svelte";
   import Editor from "./components/Editor.svelte";
   import Output from "./components/Output.svelte";
   import { lexer } from "./lib/analyzers/lexer";
   import { parser } from "./lib/analyzers/parser";
   import { interpreter, interpreterReset, addSentence } from "./lib/code/interpreter"
   
   let isProgramRunning: boolean = false;
   let enableUserInput: boolean;
   let pseudocode: string;
   let lastPseudocode: string;
   let syntaxTree: object;
   let outputText: string;
   let pendingSentencesToExecute: atype.SentencesNode[];
   let lastExecutedSentence: atype.SentencesNode;

   window.onkeydown = function (event) {
      if (event.code === 'F5') {
         event.preventDefault();
         if (!isProgramRunning) {
            isProgramRunning = true;
            prepare();
         }
      } else if (event.code === 'Escape' && isProgramRunning) {
         enableUserInput = false;
         isProgramRunning = false;
      }
   }

   function prepare() {
      if (pseudocode !== lastPseudocode) {
         lastPseudocode = pseudocode;
         const tokens = lexer(pseudocode);
         syntaxTree = parser(tokens);
      }
      outputText = "<div class=\"hl-comments\">Program started ***</div>";
      interpreterReset();
      execute(syntaxTree['body']);
   }

   function execute(sentences?: atype.SentencesNode[]) {
      const execution = interpreter(sentences);
      outputText += execution.prints;
      enableUserInput = execution.interruptedForInput;
      pendingSentencesToExecute = execution.pendingSentences;
      lastExecutedSentence = execution.lastNode;

      if (!enableUserInput && !pendingSentencesToExecute.length) {
         outputText += "<div class=\"hl-comments\">Program end ***</div>";
      }
   }

   function runButtonClick(e) {
      if (isProgramRunning = e.detail) {
         prepare();
      }
   }

   function capturedMessage(e) {
      const value = e.detail.text? e.detail.text : false;
      enableUserInput = false;
      addSentence({ 
         name: 'AssignmentNode', 
         identifier: lastExecutedSentence['identifier'].value, 
         value: { name: 'StringNode', value:  value as string } 
      }, 0)

      outputText += "<span class=\"hl-read\" style=\"opacity: 0.5\">" + e.detail.text.replaceAll(' ', '&nbsp;') + "</span><br>";
      execute();
   }
</script>

<Topbar on:runButtonClick={runButtonClick} bind:isProgramRunning={isProgramRunning} />
<div id="wrapper">
   <div id="flowchart-area"></div>
   <div id="output-area" class:active="{isProgramRunning}">
      <Output content="{outputText}" isInputPromptEnabled="{enableUserInput}" on:message={capturedMessage} />
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