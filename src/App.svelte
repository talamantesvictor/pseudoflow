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
   let savedPseudocode: string;
   let syntaxTree: object = { body: null };
   let outputText: string;
   let pendingSentencesToExecute: atype.SentencesNode[];
   let lastExecutedSentence: atype.SentencesNode;
   let timeoutToParse: any;

   // Shortcut key handling
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
      } else if (event.code === 'Escape' && modal) {
         closeModal();
      }
   }

   // Fix modal title not updating after language change
   translationStore.subscribe((translations) => {
      if (modal) {
         modal.title = translations.APP_SETTINGS_TITLE;
      }
   });

   // Generate tree and perform pre-execution tasks on run button press
   function prepareExecution() {
      generateTree()
      outputText = "<div class=\"hl-comments\">" + $translationStore.APP_PROGRAM_STARTED + " ***</div>";
      interpreterReset();
      execute(syntaxTree['body']);
   }

   // Generate syntax tree for code interpretation and flowchart visualization
   function generateTree() {
      if (pseudocode !== lastPseudocode) {
         lastPseudocode = pseudocode;
         const tokens = lexer(pseudocode);
         syntaxTree = parser(tokens);
      }
   }

   // Run program using interpreter, store progress in case of interruption
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

   // Insert assignment node into the tree using the value captured from the user
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

   // Import code from a file using an input element in HTML
   function importDataFromFile(e) {
      filename.set(e.target.files[0].name);

      const reader = new FileReader();
		reader.addEventListener("load", (event) => {
			const result = event.target.result;
         pseudocode = result.toString();
         savedPseudocode = pseudocode;
         generateTree();
		});
		reader.readAsText(e.target.files[0], "UTF-8");
   }

   // Handle "New Page" button in top bar
   function newButtonClick() {
      if (pseudocode && pseudocode !== savedPseudocode) {
         modal = {
            title: $translationStore.APP_SAVE_TITLE,
            component: SaveModal,
            saveDialog: true
         };
      }
      else {
         newDocument();
      }
   }

   // Handle "Open" button in top bar
   function importButtonClick() {
      let element = document.getElementById("file-import");
      element.click();
   }

   // Handle "Save" button in top bar
   async function exportButtonClick() {
      let exported = false;
      // Desktop
      try {
         const filePath = await save({
            defaultPath: $filename
         });
         if (filePath) {
            await invoke('save_file', {path: filePath, contents: pseudocode});
            filename.set(filePath);
            savedPseudocode = pseudocode;
            exported = true;
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
         savedPseudocode = pseudocode;
         exported = true;
      };

      return exported;
   }

   // Handle "Run" button in top bar
   function runButtonClick(e) {
      if (isProgramRunning = e.detail) {
         prepareExecution();
      }
      else {
         interpreterReset();
         enableUserInput = false;
      }
   }

   // Handle "Settings" button in top bar
   function settingsButtonClick() {
      modal = {
         title: $translationStore.APP_SETTINGS_TITLE,
         component: SettingsModal
      };
   }

   // Handle "Information" button in top bar
   function infoButtonClick() {
      modal = {
         title: $translationStore.APP_INFO_TITLE,
         component: InformationModal
      };
   }

   // Used in save-warning-dialog modal
   async function saveAndClose() {
      closeModal();
      if (await exportButtonClick()) {
         newDocument();
      }
   }

   // Used in save-warning-dialog modal
   function closeAndNew() {
      closeModal();
      newDocument();
   }

   // Reset variables
   function newDocument() {
      isProgramRunning = false;
      isChartVisible = false;
      pseudocode = '';
      savedPseudocode = '';
      outputText = '';
      pendingSentencesToExecute = [];
      lastExecutedSentence = null;
      clearTimeout(timeoutToParse);
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

<input type="file" id="file-import" on:change={importDataFromFile} />

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