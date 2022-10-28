<script lang="ts">
   import { onMount } from "svelte";
   import Konva from 'konva';
   import { drawer } from "../lib/chart/drawer"
   import type { SentencesNode } from "src/lib/analyzers/atypes";

   export let sintaxTree: SentencesNode[];
   let konvaContainer, konvaStage, konvaSize;
   const chartLayer = new Konva.Layer();
   
   $: {
      let vspace = drawer(sintaxTree || [], chartLayer, konvaSize?.width);

      if (konvaStage) {
         konvaStage.height(vspace);
      }
   }

   onMount(() => { 
      konvaSize = {
         width: konvaContainer.offsetWidth,
         height: konvaContainer.offsetHeight
      }

      konvaStage = new Konva.Stage({
         container: konvaContainer,
         width: konvaSize.width,
         height: konvaSize.height,
      });

      konvaStage.add(chartLayer);
   });

</script>

<div id="konvaContainer" bind:this={konvaContainer} />

<style lang="scss">

   #konvaContainer {
      width: 100%;
      height: 100%;
      overflow: auto;
   }

</style>