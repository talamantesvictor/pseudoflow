<script lang="ts">
   import Konva from 'konva';
   import { onMount } from "svelte";
   import { grapher } from "../lib/chart/grapher"
   import type { SentencesNode } from "src/lib/analyzers/atypes";

   export let sintaxTree: SentencesNode[];
   let konvaContainer, konvaStage;
   let konvaScale = 0.5;
   let userScale = konvaScale * 100;
   const chartLayer = new Konva.Layer();
   
   $: {
      if (sintaxTree && konvaStage) {
         let vspace = grapher(sintaxTree, chartLayer, konvaContainer.offsetWidth);
         konvaStage.height(vspace * konvaScale);
         chartLayer.scale({
            x: konvaScale, 
            y: konvaScale
         });
      }
   }

   onMount(() => { 
      konvaStage = new Konva.Stage({
         container: konvaContainer,
         width: konvaContainer.offsetWidth,
         height: konvaContainer.offsetHeight
      });

      konvaStage.add(chartLayer);
   });

</script>

<div id="konvaContainer" bind:this={konvaContainer} />
<div id="scaler">
   <div>
      <span>Zoom:</span> {userScale * 2}%
   </div>
   <input type="range" min="0" max="100" bind:value="{userScale}" on:input="{() => konvaScale = userScale / 100}" />
</div>

<style lang="scss">
   @import "../styles/variables.scss";

   #konvaContainer {
      width: 100%;
      height: calc(100% - 55px);
      overflow: auto;
   }

   #scaler {
      width: 100%;
      height: 55px;
      background: #1C1F2D;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: space-around;

      div {
         text-align: left;
         width: 40%;

         span {
            color: rgba(255, 255, 255, 0.5);
         }
      }

      input[type=range] {
         width: 40%;
         margin: 5px 0;
         background-color: transparent;
         -webkit-appearance: none;
      }

      input[type=range]::-webkit-slider-runnable-track {
         background: rgba(63, 66, 84, 0.78);
         border: 0;
         border-radius: 25px;
         width: 100%;
         height: 5px;
         cursor: pointer;
      }

      input[type=range]::-webkit-slider-thumb {
         margin-top: -5px;
         width: 20px;
         height: 20px;
         background: #00bbd3;
         border: 0;
         border-radius: 15px;
         cursor: pointer;
         -webkit-appearance: none;
      } 

      input[type=range]::-moz-range-track {
         background: rgba(63, 66, 84, 0.78);
         border: 0;
         border-radius: 25px;
         width: 100%;
         height: 5px;
         cursor: pointer;
      }

      input[type=range]::-moz-range-thumb {
         width: 10px;
         height: 20px;
         background: #00bbd3;
         border: 0;
         border-radius: 15px;
         // transform: translateX(50%);
         cursor: pointer;
      }
      
   }

</style>