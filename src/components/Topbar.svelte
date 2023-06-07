<script lang="ts">
   import { createEventDispatcher } from "svelte";
   import { translationStore, fileName } from "../lib/stores";
   import newButton from '../../static/images/new_button.svg';
   import openButton from '../../static/images/open_button.svg';
   import saveButton from '../../static/images/save_button.svg';
   import settingsButton from '../../static/images/settings_button.svg';
   import infoButton from '../../static/images/info_button.svg';
   import playButton from '../../static/images/play_button.svg';
   import stopButton from '../../static/images/stop_button.svg';

   const topbarDispatcher = createEventDispatcher();
   export let isProgramRunning: boolean;
   export let isChartVisible: boolean;
   let isMenuOpen: boolean;
   let executeButtonImage: any = playButton;

   const chartToggleClick = () => {
      isChartVisible = !isChartVisible;
   }

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
      <div id="menuWrapper">
         <div id="toggleButton">
            <input type="checkbox" on:click="{() => isMenuOpen = !isMenuOpen}" />
            <div>
               <span></span>
               <span></span>
               <span></span>
            </div>
         </div>
         <ul id="menu" class:active="{isMenuOpen}">
            <li class="tooltip" on:click={newButtonClick}>
               <img src="{newButton}" alt="New Button" />
               <span class="tooltiptext">{$translationStore.APP_NEW}</span>
            </li>
            <li class="tooltip" on:click={importButtonClick}>
               <img src="{openButton}" alt="Open Button" />
               <span class="tooltiptext">{$translationStore.APP_OPEN}</span>
            </li>
            <li class="tooltip" on:click={exportButtonClick}>
               <img src="{saveButton}" alt="Save Button" />
               <span class="tooltiptext">{$translationStore.APP_SAVE}</span>
            </li>
            <li class="tooltip" on:click={settingsButtonClick}>
               <img src="{settingsButton}" alt="Settings Button" />
               <span class="tooltiptext">{$translationStore.APP_SETTINGS_TITLE}</span>
            </li>
            <li class="tooltip" on:click={infoButtonClick}>
               <img src="{infoButton}" alt="Info Button" />
               <span class="tooltiptext">{$translationStore.APP_INFO_TITLE}</span>
            </li>
         </ul>
      </div>
   </div>
   <div class="right">
      <div id="fileinfo">
         <span>{$translationStore.APP_FILE}:</span>
         <span>{$fileName.split(/(\\|\/)/g).pop()}</span>
      </div>
      <div id="chartToggle" on:click={chartToggleClick} class:active="{isChartVisible}" >
         {$translationStore.APP_CHART_TOGGLE}
      </div>
      <div id="runButton" on:click={runButtonClick}>
         <img src="{executeButtonImage}" alt="Play Button" />
         {isProgramRunning? $translationStore.APP_STOP : $translationStore.APP_RUN}
      </div>
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

      .left {
         height: 100%;

         #menuWrapper {
            height: 100%;

            #menu {
               display: none;
               width: 250px;
               position: absolute;
               z-index: 4;
               background: $topbar-background;
               list-style: none;
               margin: 0;
               padding: 0 0 0.5rem 0;
               
               li {
                  display: flex;
                  align-items: center;
                  justify-content:left;
                  margin-bottom: 0.4rem;
                  color: white;

                  cursor: pointer;

                  &:hover {
                     color: $accent-color;
                  }

                  img {
                     margin: 0.4rem;
                     padding: 0 0.5rem;
                     width: calc($topbar-height * 0.4);
                     height: calc($topbar-height * 0.4);
                     
                     &:first-child {
                        margin-left: 0.8rem;
                     }
                  }
               }

               &.active {
                  display: block;
               }

               @media screen and (min-width: $breakpoint) {
                  width: auto;
                  height: 100%;
                  position:relative;
                  display: flex !important;
                  justify-content: center;
                  padding: 0;

                  li {
                     margin: 0;

                     img {
                        margin: 0;
                     }
                  }
               }
            }
         }

         #toggleButton {
            margin-left: 1rem;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;

            input {
               display: block;
               width: 30px;
               height: 30px;
               position: absolute;
               opacity: 0;
               z-index: 2;
               cursor: pointer;
               -webkit-touch-callout: none;
            }
   
            div span {
               display: block;
               width: 25px;
               height: 2px;
               margin: 6px 0;
               position: relative;
               background: $accent-color;
               border-radius: 3px;
               z-index: 1;
   
               transition: transform 0.3s cubic-bezier(0.77, 0.2, 0.05, 1),
                  background 0.3s cubic-bezier(0.77, 0.2, 0.05, 1), opacity 0.35s ease;
            }
   
            div span:first-child {
               transform-origin: bottom left;
            }
   
            div span:nth-last-child(1) {
               transform-origin: bottom left;
               // transform-origin: 0% 100%;
            }
   
            input:checked ~ div span:first-child {
               transform: rotate(45deg) scale(1.1, 1.1) translate(1px, -3px);
            }

            input:checked ~ div span:nth-last-child(1) {
               transform: rotate(-45deg) scale(1.1, 1.1) translate(1.5px, 3.5px);
            }

            input:checked ~ div span:nth-last-child(2) {
               opacity: 0;
               transform: rotate(0deg) scale(0.2, 0.2);
            }

            @media screen and (min-width: $breakpoint) {
               display: none;
            }
         }
      }

      .right {
         display: flex;

         #fileinfo {
            background-color: $fileinfo-background;
            color: $fileinfo-foreground;
            width: 300px;
            height: 2rem;
            border-radius: 0.5rem;
            padding: 0 0.8rem;
            align-items: center;
            display: none;

            span {
               opacity: 0.5;
            }

            span:first-child {
               font-weight: bold;
               margin-right: 0.3rem;
            }

            @media screen and (min-width: $breakpoint) {
               display: flex;
            }
         }

         #chartToggle {
            background-color: $accent-color;
            height: 2rem;
            display: flex;
            justify-content: center;
            padding: 0 1.4rem;
            border-radius: 1rem;
            display: flex;
            align-items: center;
            cursor: pointer;

            &.active {
               background-color: #3F4254;
               color: white;
            }

            @media screen and (min-width: $breakpoint) {
               display: none;
            }
         }

         #runButton {
            background-color: $runbutton-background;
            color: $accent-color;
            height: 2rem;
            display: flex;
            justify-content: center;
            padding: 0 1.4rem;
            margin: 0 1rem;
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
