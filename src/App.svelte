<script lang="ts">
   import { translationStore, filename } from "./lib/stores";
   import type * as atype from "./lib/analyzers/atypes"
   import Topbar from "./components/Topbar.svelte";
   import Editor from "./components/Editor.svelte";
   import Output from "./components/Output.svelte";
   import Chart from "./components/Chart.svelte";
   import Modal from "./components/Modal.svelte";
   import SaveModal from "./components/modals/SaveModal.svelte";
   import SettingsModal from "./components/modals/SettingsModal.svelte";
   import InformationModal from "./components/modals/InformationModal.svelte";
   import { save } from "@tauri-apps/api/dialog";
   import { invoke } from "@tauri-apps/api/tauri";

   import { lexer } from "./lib/analyzers/lexer";
   import { parser } from "./lib/analyzers/parser";
   import { interpreter, interpreterReset, addSentence } from "./lib/code/interpreter";
   
   let modal: any;
   let isProgramRunning: boolean = false;
   let isChartVisible: boolean = false;
   let enableUserInput: boolean;
   let pseudocode: string;
   let lastPseudocode: string;
   let syntaxTree: object = { body: null };
   let outputText: string;
   let pendingSentencesToExecute: atype.SentencesNode[];
   let lastExecutedSentence: atype.SentencesNode;
   let timeoutToParse: any;

   window.onkeydown = function (event) {
      clearTimeout(timeoutToParse);
      timeoutToParse = setTimeout(generateTree, 350);

      if (event.code === 'F5') {
         event.preventDefault();
         if (!isProgramRunning) {
            isProgramRunning = true;
            prepareExecution();
         }
      } else if (event.code === 'Escape' && isProgramRunning) {
         interpreterReset();
         enableUserInput = false;
         isProgramRunning = false;
      }
   }

   translationStore.subscribe((translations) => {
      if (modal) {
         modal.title = translations.APP_SETTINGS_TITLE;
      }
   });

   function generateTree() {
      if (pseudocode !== lastPseudocode) {
         lastPseudocode = pseudocode;
         const tokens = lexer(pseudocode);
         syntaxTree = parser(tokens);
      }
   }

   function prepareExecution() {
      generateTree()
      outputText = "<div class=\"hl-comments\">" + $translationStore.APP_PROGRAM_STARTED + " ***</div>";
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
         outputText += "<div class=\"hl-comments\">" + $translationStore.APP_PROGRAM_END + " ***</div>";
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

   function importData(e) {
      let element = document.getElementById("file-import");
      filename.set(element['value'].split(/(\\|\/)/g).pop());

      const reader = new FileReader();
		reader.addEventListener("load", (event) => {
			const result = event.target.result;
         pseudocode = result.toString();
         generateTree();
		});
		reader.readAsText(e.target.files[0], "UTF-8");
   }

   function newButtonClick() {
      // Pending: add a warning modal
      modal = {
         title: $translationStore.APP_SAVE_TITLE,
         component: SaveModal,
         saveDialog: true
      };
      
      // pseudocode = '';
      // generateTree();
   }

   function importButtonClick() {
      let element = document.getElementById("file-import");
      element.click();
   }

   async function exportButtonClick() {
      // Desktop
      try {
         const savePath = await save();
         if (savePath) {
            await invoke('save_file', {filename: $filename, contents: pseudocode});
         }
      } 
      // Web
      catch (err) {
         let textBlob = new Blob([pseudocode], {type: 'text/plain'});
         let tempLink = document.createElement("a");
         tempLink.setAttribute('href', URL.createObjectURL(textBlob));
         tempLink.setAttribute('download', $filename);
         tempLink.click();
         URL.revokeObjectURL(tempLink.href);
      };
   }

   function runButtonClick(e) {
      if (isProgramRunning = e.detail) {
         prepareExecution();
      }
      else {
         interpreterReset();
         enableUserInput = false;
      }
   }

   function settingsButtonClick() {
      modal = {
         title: $translationStore.APP_SETTINGS_TITLE,
         component: SettingsModal
      };
   }

   function infoButtonClick() {
      modal = {
         title: $translationStore.APP_INFO_TITLE,
         component: InformationModal
      };
   }

   function saveAndClose() {
      closeModal();
      exportButtonClick();
   }

   function closeAndNew() {
      closeModal();
      newDocument();
   }

   function newDocument() {
      pseudocode = '';
      generateTree();
   }

   function closeModal() {
      modal = undefined;
   }

</script>


<Topbar 
   on:runButtonClick={runButtonClick} 
   on:newButtonClick={newButtonClick}
   on:importButtonClick={importButtonClick}
   on:exportButtonClick={exportButtonClick}
   on:settingsButtonClick={settingsButtonClick}
   on:infoButtonClick={infoButtonClick}
   bind:isProgramRunning={isProgramRunning}
   bind:isChartVisible={isChartVisible} />

<div id="wrapper" on:mousedown={generateTree}>
   <div id="flowchart-area" class:active={isChartVisible}>
      <Chart sintaxTree="{syntaxTree['body']}"></Chart>
   </div>
   <div id="output-area" class:active="{isProgramRunning}">
      <Output content="{outputText}" isInputPromptEnabled="{enableUserInput}" on:message={capturedMessage} />
   </div>
   <div id="text-area">
      <Editor bind:editorText={pseudocode} />
   </div>
</div>

<input type="file" id="file-import" on:change={importData} />
{#if modal} 
<Modal title="{modal.title}" component="{modal.component}" saveDialog="{modal.saveDialog}"
   on:closeModal="{closeModal}"
   on:saveAndClose="{saveAndClose}"
   on:closeAndNew="{closeAndNew}"></Modal> 
{/if}

<style lang="scss">
   @import "./styles/variables.scss";

   #wrapper {
      height: calc(100% - $topbar-height);
      background: $editor-background;
      overflow: hidden;

      #text-area {
         display: flex;
         width: 100%;
         flex-direction: column;
         background-color: $editor-background;
         height: calc(100vh - $topbar-height);
         overflow: hidden;
         position: absolute;

         @media screen and (min-width: $breakpoint) {
            width: 60%;
         }
      }

      #output-area {
         width: 100%;
         height: calc(100% - $topbar-height);
         background-color: $flowchart-background;
         color: white;
         position: absolute;
         left: 0;
         transform: translateX(100%);
         transition: transform 0.2s;
         overflow-y: auto;
         z-index: 2;

         &.active {
            transform: translateX(0%);
         }

         @media screen and (min-width: $breakpoint) {
            width: 60%;
         }
      }

      #flowchart-area {
         width: 100%;
         height: calc(100% - $topbar-height);
         background-color: $flowchart-background;
         color: white;
         border-left: 1px solid $editor-background;
         position: absolute;
         right: 0;
         z-index: 0;

         &.active {
            z-index: 3;
         }

         @media screen and (min-width: $breakpoint) {
            width: 40%;
            z-index: 3;
         }
      }
   }

   #file-import {
		display: none;
	}
</style>