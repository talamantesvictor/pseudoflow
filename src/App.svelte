<script lang="ts">
   import Topbar from "./components/Topbar.svelte";
   import Editor from "./components/Editor.svelte";
   import { arrayEquals } from "./lib/helpers"

   let currentTokens: string[] = [];
   let lastTokens: string[] = [];

   // $: {
   //    if (!arrayEquals(currentTokens, lastTokens)) {
   //       lastTokens = currentTokens;
   //       // Here goes code to analyze pseudocode and show errors if wanted
   //    }
   // }

   function runCode(e) {
      console.log(currentTokens);
   }
</script>

<Topbar on:runButtonClick={runCode} />
<div id="wrapper">
   <div id="flowchart-area"></div>
   <div id="text-area">
      <Editor bind:tokens={currentTokens} />
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