<script lang="ts">
   import { translationStore, defaultName, fileNameStore, flowchartDrawingStore, errorStore } from "./lib/stores";
   import type * as atype from "./lib/analyzers/atypes"
   import Topbar from "./components/Topbar.svelte";
   import Editor from "./components/Editor.svelte";
   import Output from "./components/Output.svelte";
   import Chart from "./components/Chart.svelte";
   import ErrorPanel from "./components/ErrorPanel.svelte";
   import Modal from "./components/Modal.svelte";
   import SaveModal from "./components/modals/SaveModal.svelte";
   import SettingsModal from "./components/modals/SettingsModal.svelte";
   import InformationModal from "./components/modals/InformationModal.svelte";

   import { analyze } from "./lib/analyzers/analyze";
   import { interpreter, interpreterReset, addSentence } from "./lib/code/interpreter";

   const isTauri = typeof import.meta.env.TAURI_PLATFORM !== 'undefined';
   
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

    let pointerStartX, rightColumnStartWidth;
    let editorRef: any;

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
      if ($errorStore.some(e => e.type === 'syntax')) {
         isProgramRunning = false;
         return;
      }
      outputText = "<div class=\"hl-comments\">" + $translationStore.APP_PROGRAM_STARTED + " ***</div>";
      interpreterReset();
      execute(syntaxTree['body']);
   }

   // Generate syntax tree for code interpretation and flowchart visualization
   function generateTree() {
      if (pseudocode !== lastPseudocode) {
         lastPseudocode = pseudocode;
         const result = analyze(pseudocode);
         syntaxTree = result.program ?? { body: null };
         errorStore.set(result.errors);
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
    function capturedMessage(e: CustomEvent<{text: string}>) {
       const value = e.detail.text? e.detail.text : false;
      enableUserInput = false;
      addSentence({ 
         name: 'AssignmentNode', 
         identifier: { name: 'IdentifierNode', value: lastExecutedSentence['identifier'].value }, 
         value: { name: 'StringNode', value: value as string } 
      }, 0)

      outputText += "<span class=\"hl-read\" style=\"opacity: 0.5\">" + e.detail.text.replaceAll(' ', '&nbsp;') + "</span><br>";
      execute();
   }

   // Import code from a file using an input element in HTML
    function importDataFromFile(e: Event) {
       const target = e.target as HTMLInputElement;
       fileNameStore.set(target.files[0].name);

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
      if (isTauri) {
         import("@tauri-apps/api/dialog").then(async ({ open }) => {
            const { readTextFile } = await import("@tauri-apps/api/fs");
            const filePath = await open({ defaultPath: $fileNameStore });
            if (filePath) {
               const data = await readTextFile(filePath as string);
               pseudocode = data.toString();
               savedPseudocode = pseudocode;
               generateTree();
               fileNameStore.set((filePath as string).split(/(\\|\/)/g).pop());
            }
         });
      } else {
         document.getElementById("file-import").click();
      }
   }

   // Handle "Save" button in top bar
   function exportButtonClick() {
      if (isTauri) {
         import("@tauri-apps/api/dialog").then(async ({ save }) => {
            const { invoke } = await import("@tauri-apps/api/tauri");
            const filePath = await save({ defaultPath: $fileNameStore });
            if (filePath) {
               await invoke('save_file', { path: filePath, contents: pseudocode });
               fileNameStore.set(filePath.split(/(\\|\/)/g).pop());
               savedPseudocode = pseudocode;
            }
         });
         return false;
      }
      let textBlob = new Blob([pseudocode], {type: 'text/plain'});
      let tempLink = document.createElement("a");
      tempLink.setAttribute('href', URL.createObjectURL(textBlob));
      tempLink.setAttribute('download', $fileNameStore);
      tempLink.click();
      tempLink.remove();
      URL.revokeObjectURL(tempLink.href);
      savedPseudocode = pseudocode;
      return true;
   }

   // Handle "Run" button in top bar
   function runButtonClick(running: boolean) {
      if (running) {
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

    function undoClick() { editorRef?.undoAction(); }
    function redoClick() { editorRef?.redoAction(); }

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
      errorStore.set([]);
      fileNameStore.set(defaultName);
      generateTree();
   }

   function closeModal() {
      modal = undefined;
   }

   function startResizing(event) {
      pointerStartX = event.clientX;
      rightColumnStartWidth = document.getElementById('flowchart-area').offsetWidth;
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResizing);
      document.body.classList.add('no-select');
   }

   function resize(event) {
      const currentX = event.clientX;
      const deltaX = currentX - pointerStartX;
      const rightColumnWidth = rightColumnStartWidth - deltaX;
      const leftColumnWidth = document.getElementById('wrapper').offsetWidth - rightColumnWidth;

      document.getElementById('flowchart-area').style.width = `${rightColumnWidth}px`;
      document.getElementById('resizer').style.right = `${rightColumnWidth}px`;
      document.getElementById('text-area').style.width = `${leftColumnWidth}px`;
      document.getElementById('output-area').style.width = `${leftColumnWidth}px`;
   }

   function stopResizing() {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResizing);
      document.body.classList.remove('no-select');
   }

</script>


<Topbar 
   onRunButtonClick={runButtonClick}
   onNewButtonClick={newButtonClick}
   onImportButtonClick={importButtonClick}
   onExportButtonClick={exportButtonClick}
   onSettingsButtonClick={settingsButtonClick}
   onInfoButtonClick={infoButtonClick}
   onUndoClick={undoClick}
   onRedoClick={redoClick}
   bind:isProgramRunning={isProgramRunning}
   bind:isChartVisible={isChartVisible} />

<div id="wrapper" on:mousedown={generateTree}>
   {#if $flowchartDrawingStore}
   <div id="flowchart-area" class:active={isChartVisible}>
      <Chart sintaxTree="{syntaxTree['body']}"></Chart>
   </div>
   {/if}
   <div id="output-area" class:active="{isProgramRunning}" class:twoColumnLayout="{$flowchartDrawingStore}">
      <Output content="{outputText}" isInputPromptEnabled="{enableUserInput}" on:message={capturedMessage} />
   </div>
   <div id="resizer" on:mousedown={startResizing}></div>
   <div id="text-area" class:twoColumnLayout="{$flowchartDrawingStore}">
      <Editor bind:editorText={pseudocode} bind:this={editorRef} />
      <ErrorPanel />
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
   @use "./styles/variables.scss" as *;

   #wrapper {
      height: calc(100% - $topbar-height);
      background: $editor-background;
      overflow: hidden;

      #resizer {
         width: 8px;
         height: calc(100vh - $topbar-height);
         cursor: ew-resize;
         border-right: 1px solid $accent-color;
         position: absolute;
         right: 40%;
         z-index: 10;
         opacity: 0;
         transition: opacity 0.4s;
         
         &:hover, &:active {
            opacity: 1;
         }
      }

      #text-area {
         display: flex;
         width: 100%;
         max-width: 100%;
         flex-direction: column;
         background-color: $editor-background;
         height: calc(100vh - $topbar-height);
         overflow: hidden;
         position: absolute;

         &.twoColumnLayout {
            @media screen and (min-width: $breakpoint) {
               width: 60%;
            }
         }
      }

      #output-area {
         width: 100%;
         max-width: 100%;
         height: calc(100% - $topbar-height);
         background-color: $flowchart-background;
         color: white;
         position: absolute;
         left: 0;
         transform: translateX(100vw);
         transition: all 0.2s;
         overflow-y: auto;
         z-index: 2;
         opacity: 0;
         
         &.active {
            opacity: 1;
            transform: translateX(0%);
         }

         &.twoColumnLayout {
            @media screen and (min-width: $breakpoint) {
               width: 60%;
            }
         }
      }

      #flowchart-area {
         width: 100%;
         max-width: 100%;
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
      position: absolute;
      left: -9999px;
      top: -9999px;
   }
</style>
