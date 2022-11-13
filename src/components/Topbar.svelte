<script lang="ts">
   import { createEventDispatcher } from "svelte";
   import newButton from '../../static/images/new_button.svg';
   import openButton from '../../static/images/open_button.svg';
   import saveButton from '../../static/images/save_button.svg';
   import settingsButton from '../../static/images/settings_button.svg';
   import infoButton from '../../static/images/info_button.svg';
   import playButton from '../../static/images/play_button.svg';
   import stopButton from '../../static/images/stop_button.svg';

   const topbarDispatcher = createEventDispatcher();
   export let isProgramRunning: boolean;
   let executeButtonImage: any = playButton;

   const runButtonClick = () => {
      isProgramRunning = !isProgramRunning;
      topbarDispatcher("runButtonClick", isProgramRunning);
   };

   const newButtonClick = () => {
      topbarDispatcher("newButtonClick");
   }

   const importButtonClick = () => {
      topbarDispatcher("importButtonClick");
   }

   const exportButtonClick = () => {
      topbarDispatcher("exportButtonClick");
   }

   const settingsButtonClick = () => {
      topbarDispatcher("settingsButtonClick");
   }

   const infoButtonClick = () => {
      topbarDispatcher("infoButtonClick");
   }

   $: executeButtonImage = isProgramRunning? stopButton : playButton;
</script>


<div id="topbar">
   <div class="left">
      <img src="{newButton}" alt="New Button" on:click={newButtonClick} />
      <img src="{openButton}" alt="Open Button" on:click={importButtonClick} />
      <img src="{saveButton}" alt="Save Button" on:click={exportButtonClick} />
   </div>
   <div class="middle">
      <div id="fileinfo">
         <span>File:</span>
         <span>pseudocode.pff</span>
      </div>
      <div id="runbutton" on:click={runButtonClick}>
         <img src="{executeButtonImage}" alt="Play Button" />
         {isProgramRunning? "Stop" : "Run"}
      </div>
   </div>
   <div class="right">
      <img src="{settingsButton}" alt="Settings Button" on:click={settingsButtonClick} />
      <img src="{infoButton}" alt="Info Button" on:click={infoButtonClick} />
   </div>
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

      .left, .right {
         display: flex;
         width: 0px;
         img {
            margin: 0 0.5rem;
            padding: 0 0.5rem;
            height: calc($topbar-height * 0.4);
            cursor: pointer;
         }
      }

      .right {
         justify-content: right;
      }

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
            display: flex;
            justify-content: center;
            padding: 0 1.4rem;
            border-radius: 1rem;
            display: flex;
            align-items: center;
            cursor: pointer;

            img {
               width: 0.9rem;
               margin-right: 0.6rem;
            }
         }
      }
   }
</style>
