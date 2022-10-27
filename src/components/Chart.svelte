<script lang="ts">
   import { onMount } from "svelte";
   import Konva from 'konva';

   let konvaContainer, konvaStage, konvaSize;
   const chartLayer = new Konva.Layer();

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