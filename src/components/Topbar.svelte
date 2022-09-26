<script>
   import { createEventDispatcher } from "svelte";

   const topbarDispatcher = createEventDispatcher();
   const runButtonClick = () => {
      topbarDispatcher("runButtonClick", "hola");
   };
</script>

<div id="topbar">
   <div class="left" />
   <div class="middle">
      <div id="fileinfo">
         <span>File:</span>
         <span>pseudocode.pff</span>
      </div>
      <div id="runbutton" on:click={runButtonClick}>Run</div>
   </div>
   <div class="right" />
</div>

<style lang="scss">
   @import "../styles/variables.scss";

   #topbar {
      width: 100vw;
      height: $topbar-height;
      background-color: $topbar-background;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .middle {
         display: flex;

         #fileinfo {
            background-color: $fileinfo-background;
            color: $fileinfo-foreground;
            width: 300px;
            height: 2rem;
            border-radius: 0.5rem;
            padding: 0 0.8rem;
            display: flex;
            align-items: center;
            margin-right: 0.8rem;

            span {
               opacity: 0.5;
            }

            span:first-child {
               font-weight: bold;
               margin-right: 0.3rem;
            }
         }

         #runbutton {
            background-color: $runbutton-background;
            color: $accent-color;
            height: 2rem;
            text-align: center;
            padding: 0 1.4rem;
            border-radius: 1rem;
            display: flex;
            align-items: center;
            cursor: pointer;
         }
      }
   }
</style>
