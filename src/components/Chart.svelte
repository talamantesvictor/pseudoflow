<script lang="ts">
   import Konva from 'konva';
   import { onMount } from "svelte";
   import { grapher } from "../lib/chart/grapher"
   import type { SentencesNode } from "src/lib/analyzers/atypes";
   import { translationStore } from "../lib/stores";

   export let sintaxTree: SentencesNode[];
   let konvaContainer, konvaStage;
   let userScale = 50;
   let konvaScale = 0.5;
   let chartDimensions;
   let autoFit = true;
   const arrowsLayer = new Konva.Layer();
   const symbolsLayer = new Konva.Layer();
   
   $: if (sintaxTree && konvaContainer) {
      chartDimensions = grapher(sintaxTree, arrowsLayer, symbolsLayer, konvaContainer.offsetWidth * 0.8);
   }

   $: if (autoFit && chartDimensions && konvaContainer) {
      const containerW = konvaContainer.offsetWidth;
      const containerH = konvaContainer.offsetHeight;
      if (containerW > 0 && containerH > 0) {
         const scaleX = containerW / chartDimensions.x;
         const scaleY = containerH / chartDimensions.y;
         userScale = Math.max(5, Math.min(100, Math.min(scaleX, scaleY) * 100));
      }
   }

   $: konvaScale = userScale / 100;

   $: if (konvaStage) {
      konvaStage.width(chartDimensions.x * konvaScale);
      konvaStage.height(chartDimensions.y * konvaScale);

      symbolsLayer.scale({
         x: konvaScale, 
         y: konvaScale
      });

      arrowsLayer.scale({
         x: konvaScale, 
         y: konvaScale
      });
   }

   function disableAutoFit() {
      autoFit = false;
   }

   function toggleAutoFit() {
      autoFit = !autoFit;
   }

   onMount(() => { 
      chartDimensions = {
         x: konvaContainer.offsetWidth,
         y: konvaContainer.offsetHeight
      }

      konvaStage = new Konva.Stage({
         container: konvaContainer,
         width: konvaContainer.offsetWidth,
         height: konvaContainer.offsetHeight
      });

      konvaStage.add(arrowsLayer);
      konvaStage.add(symbolsLayer);

   });

</script>


<div id="chart-wrapper">
   <div id="konvaContainer" bind:this={konvaContainer} />
   <div id="scaler">
      <div>
         <span>Zoom:</span> {Math.round(userScale)}%
      </div>
      <input type="range" min="5" max="100" bind:value={userScale} on:input={disableAutoFit} />
      <button id="autoFitBtn" class:active={autoFit} on:click={toggleAutoFit} title={$translationStore.APP_CHART_AUTOFIT}>
         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
         </svg>
      </button>
   </div>
</div>


<style lang="scss">
   @use "../styles/variables.scss" as *;

    #chart-wrapper {
       width: 100%;
       height: 100%;
       display: flex;
       flex-direction: column;
       overflow: hidden;
    }

    #konvaContainer {
       width: 100%;
       flex: 1;
       overflow: auto;
    }

    #scaler {
       width: 100%;
       background: #1C1F2D;
       border-top: 1px solid #3F4254;
       display: flex;
       align-items: center;
       justify-content: center;
       gap: 2.5rem;
       padding: 0.8rem 1.5rem;
       box-sizing: border-box;
       flex-shrink: 0;
       min-height: 4rem;

      > div {
         display: flex;
         align-items: center;
         white-space: nowrap;
         flex-shrink: 0;

         span {
            color: rgba(255, 255, 255, 0.5);
         }
      }

      input[type=range] {
         flex: 1 1 0;
         min-width: 20px;
         background-color: transparent;
         appearance: none;
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
         width: 10px;
         height: 20px;
         margin-top: 2.5px;
         transform: translateY(-50%);
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
         cursor: pointer;
      }

      #autoFitBtn {
         width: 36px;
         height: 36px;
         border-radius: 8px;
         border: 2px solid #3F4254;
         background: transparent;
         cursor: pointer;
         display: flex;
         align-items: center;
         justify-content: center;
         color: rgba(255, 255, 255, 0.5);
         transition: all 0.2s;
         flex-shrink: 0;

         &:hover {
            border-color: #00bbd3;
            color: #00bbd3;
         }

         &.active {
            border-color: #00bbd3;
            background: rgba(0, 187, 211, 0.15);
            color: #00bbd3;
         }
      }
   }

</style>
