<script lang="ts">
  import {
    translationStore,
    fileNameStore,
    flowchartDrawingStore,
    errorStore,
    canUndoStore,
    canRedoStore,
    syntaxErrorsStore,
  } from "../lib/stores";
  import newButton from "../../static/images/new_button.svg?raw";
  import openButton from "../../static/images/open_button.svg?raw";
  import saveButton from "../../static/images/save_button.svg?raw";
  import settingsButton from "../../static/images/settings_button.svg?raw";
  import infoButton from "../../static/images/info_button.svg?raw";
  import playButton from "../../static/images/play_button.svg?raw";
  import stopButton from "../../static/images/stop_button.svg?raw";
  import undoButton from "../../static/images/undo_button.svg?raw";
  import redoButton from "../../static/images/redo_button.svg?raw";

  export let isProgramRunning: boolean;
  export let isChartVisible: boolean;
  export let onRunButtonClick: (running: boolean) => void = () => {};
  export let onNewButtonClick: () => void = () => {};
  export let onImportButtonClick: () => void = () => {};
  export let onExportButtonClick: () => void = () => {};
  export let onSettingsButtonClick: () => void = () => {};
  export let onInfoButtonClick: () => void = () => {};
  export let onUndoClick: () => void = () => {};
  export let onRedoClick: () => void = () => {};
  let isMenuOpen: boolean;
  let executeButtonImage: any = playButton;
  let shakeButton: boolean = false;

  $: hasSyntaxErrors =
    $syntaxErrorsStore && $errorStore.some((e) => e.type === "syntax");

  const runButtonClick = () => {
    if (hasSyntaxErrors && !isProgramRunning) {
      shakeButton = true;
      setTimeout(() => (shakeButton = false), 500);
      return;
    }
    isProgramRunning = !isProgramRunning;
    onRunButtonClick(isProgramRunning);
  };

  const chartToggleClick = () => {
    isChartVisible = !isChartVisible;
  };

  const newButtonClick = () => {
    onNewButtonClick();
  };

  const importButtonClick = () => {
    onImportButtonClick();
  };

  const exportButtonClick = () => {
    onExportButtonClick();
  };

  const settingsButtonClick = () => {
    onSettingsButtonClick();
  };

  const infoButtonClick = () => {
    onInfoButtonClick();
  };

  $: executeButtonImage = isProgramRunning ? stopButton : playButton;

  function selectFileName(e: Event | HTMLInputElement) {
    const input = (e as Event).target || e;
    const value = input.value;
    const dotIndex = value.lastIndexOf(".");
    const end = dotIndex > 0 ? dotIndex : value.length;
    input.setSelectionRange(0, end);
  }

  function onLabelClick() {
    const input = document.getElementById("fileinfo-name");
    if (input) {
      input.focus();
      selectFileName(input);
    }
  }
</script>

<div id="topbar">
  <div class="left">
    <div id="menuWrapper">
      <div id="toggleButton">
        <input type="checkbox" on:click={() => (isMenuOpen = !isMenuOpen)} />
        <div>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <ul class="menu left-menu" class:active={isMenuOpen}>
        <li
          class="tooltip"
          on:click={newButtonClick}
          on:keydown={newButtonClick}
        >
          <span class="btn-icon">{@html newButton}</span>
          <span class="tooltiptext">{$translationStore.APP_NEW}</span>
        </li>
        <li
          class="tooltip"
          on:click={importButtonClick}
          on:keydown={importButtonClick}
        >
          <span class="btn-icon">{@html openButton}</span>
          <span class="tooltiptext">{$translationStore.APP_OPEN}</span>
        </li>
        <li
          class="tooltip"
          on:click={exportButtonClick}
          on:keydown={exportButtonClick}
        >
          <span class="btn-icon">{@html saveButton}</span>
          <span class="tooltiptext">{$translationStore.APP_SAVE}</span>
        </li>
        <li
          class="tooltip mobile-only"
          on:click={settingsButtonClick}
          on:keydown={settingsButtonClick}
        >
          <span class="btn-icon">{@html settingsButton}</span>
          <span class="tooltiptext">{$translationStore.APP_SETTINGS_TITLE}</span
          >
        </li>
        <li
          class="tooltip mobile-only"
          on:click={infoButtonClick}
          on:keydown={infoButtonClick}
        >
          <span class="btn-icon">{@html infoButton}</span>
          <span class="tooltiptext">{$translationStore.APP_INFO_TITLE}</span>
        </li>
      </ul>
      <div id="fileinfo">
        <span
          id="fileinfo-label"
          role="button"
          tabindex="-1"
          on:click={onLabelClick}
          on:keydown={onLabelClick}>{$translationStore.APP_FILE}</span
        >
        <input
          id="fileinfo-name"
          type="text"
          bind:value={$fileNameStore}
          on:focus={selectFileName}
          spellcheck="false"
        />
      </div>
      <div class="undo-redo">
        <div
          class="tooltip"
          class:disabled={!$canUndoStore}
          role="button"
          tabindex="0"
          on:click={() => $canUndoStore && onUndoClick()}
          on:keydown={() => $canUndoStore && onUndoClick()}
        >
          <span class="btn-icon">{@html undoButton}</span>
          <span class="tooltiptext">{$translationStore.APP_UNDO} (Ctrl+Z)</span>
        </div>
        <div
          class="tooltip"
          class:disabled={!$canRedoStore}
          role="button"
          tabindex="0"
          on:click={() => $canRedoStore && onRedoClick()}
          on:keydown={() => $canRedoStore && onRedoClick()}
        >
          <span class="btn-icon">{@html redoButton}</span>
          <span class="tooltiptext">{$translationStore.APP_REDO} (Ctrl+Y)</span>
        </div>
      </div>
    </div>
  </div>
  <div class="right">
    <div class="menu right-menu">
      <div
        class="tooltip"
        role="button"
        tabindex="0"
        on:click={settingsButtonClick}
        on:keydown={settingsButtonClick}
      >
        <span class="btn-icon">{@html settingsButton}</span>
        <span class="tooltiptext">{$translationStore.APP_SETTINGS_TITLE}</span>
      </div>
      <div
        class="tooltip"
        role="button"
        tabindex="0"
        on:click={infoButtonClick}
        on:keydown={infoButtonClick}
      >
        <span class="btn-icon">{@html infoButton}</span>
        <span class="tooltiptext">{$translationStore.APP_INFO_TITLE}</span>
      </div>
    </div>
    {#if $flowchartDrawingStore}
      <div
        id="chartToggle"
        role="button"
        tabindex="0"
        on:click={chartToggleClick}
        on:keydown={chartToggleClick}
        class:active={isChartVisible}
      >
        {$translationStore.APP_CHART_TOGGLE}
      </div>
    {/if}
    <div
      id="runButton"
      role="button"
      tabindex="0"
      on:click={runButtonClick}
      on:keydown={runButtonClick}
      class:blocked={hasSyntaxErrors && !isProgramRunning}
      class:shake={shakeButton}
    >
      <span class="btn-icon">{@html executeButtonImage}</span>
      {isProgramRunning
        ? $translationStore.APP_STOP
        : $translationStore.APP_RUN}
    </div>
  </div>
</div>

<style lang="scss">
  @use "../styles/variables.scss" as *;

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

        @media screen and (min-width: $breakpoint) {
          display: flex;
          align-items: center;
        }

        .left-menu {
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
            cursor: pointer;
            margin-bottom: 0.4rem;
            color: var(--color-text-primary, white);

            &:hover {
              color: $accent-color;
            }

            .btn-icon {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              margin: 0.4rem;
              padding: 0 0.5rem;
              width: calc($topbar-height * 0.4);
              height: calc($topbar-height * 0.4);

              &:first-child {
                margin-left: 0.8rem;
              }

              :global(svg) {
                width: 100%;
                height: 100%;
              }
            }
          }

          &.active {
            display: block;
          }

          @media screen and (min-width: $breakpoint) {
            width: auto;
            height: 100%;
            position: relative;
            display: flex !important;
            align-items: center;
            padding: 0;

            li {
              margin: 0;
              color: var(--color-text-primary, white);

              .btn-icon {
                margin: 0;
                padding: 0 0.5rem;
              }

              &.mobile-only {
                display: none;
              }
            }
          }
        }

        #fileinfo {
          height: 2rem;
          align-items: center;
          display: none;
          margin-left: 1rem;

          #fileinfo-label {
            background-color: $accent-color;
            color: black;
            font-weight: bold;
            font-size: 0.75rem;
            height: 100%;
            padding: 0 0.7rem;
            border-radius: 0.5rem 0 0 0.5rem;
            display: flex;
            align-items: center;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            cursor: pointer;
          }

          #fileinfo-name {
            background-color: $fileinfo-background;
            color: $fileinfo-foreground;
            height: 100%;
            width: 200px;
            padding: 0 0.6rem;
            border: 1px solid $fileinfo-background;
            border-radius: 0 0.5rem 0.5rem 0;
            outline: none;
            font-family: inherit;
            font-size: 0.85rem;

            &::selection {
              background: $accent-color;
              color: black;
            }

            &:focus {
              border-color: $accent-color;
            }
          }

          @media screen and (min-width: $breakpoint) {
            display: flex;
          }
        }

        .undo-redo {
          display: none;
          align-items: center;
          margin-left: 1rem;

          @media screen and (min-width: $breakpoint) {
            display: flex;
          }

          > div {
            display: flex;
            align-items: center;
            cursor: pointer;
            opacity: 1;
            transition: opacity 0.2s;
            color: var(--color-text-primary, white);

            .btn-icon {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: calc($topbar-height * 0.4);
              height: calc($topbar-height * 0.4);
              padding: 0 0.5rem;

              :global(svg) {
                width: 100%;
                height: 100%;
              }
            }

            &.disabled {
              opacity: 0.35;
              cursor: default;
              pointer-events: none;
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

          transition:
            transform 0.3s cubic-bezier(0.77, 0.2, 0.05, 1),
            background 0.3s cubic-bezier(0.77, 0.2, 0.05, 1),
            opacity 0.35s ease;
        }

        div span:first-child {
          transform-origin: bottom left;
        }

        div span:nth-last-child(1) {
          transform-origin: bottom left;
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

      .right-menu {
        display: none;
        align-items: center;

        > div {
          display: flex;
          align-items: center;
          cursor: pointer;
          color: var(--color-text-primary, white);
          padding: 0 0.3rem;

          .btn-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: calc($topbar-height * 0.4);
            height: calc($topbar-height * 0.4);
            padding: 0 0.5rem;

            :global(svg) {
              width: 100%;
              height: 100%;
            }
          }
        }

        @media screen and (min-width: $breakpoint) {
          display: flex;
        }
      }

      #chartToggle {
        background-color: $accent-color;
        color: white;
        height: 2rem;
        align-items: center;
        display: flex;
        justify-content: center;
        padding: 0 1.4rem;
        border-radius: 1rem;
        cursor: pointer;

        &.active {
          background-color: $border-color;
          color: var(--color-text-primary, white);
        }

        @media screen and (min-width: $breakpoint) {
          display: none;
        }
      }

      #runButton {
        background-color: var(--color-runbutton-bg, $runbutton-background);
        color: var(--color-runbutton-text, $accent-color);
         border: 2px solid var(--color-runbutton-text, $accent-color);
        height: 2rem;
        align-items: center;
        display: flex;
        justify-content: center;
        padding: 0 1.4rem;
        margin: 0 1rem;
        border-radius: 1rem;
        cursor: pointer;

        .btn-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: calc($topbar-height * 0.4);
          height: calc($topbar-height * 0.4);
          margin-right: 0.6rem;

          :global(svg) {
            width: 100%;
            height: 100%;
          }
        }

        &.blocked {
          opacity: 0.45;
          cursor: not-allowed;
        }

        &.shake {
          animation: shake 0.4s ease-in-out;
        }
      }
    }
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    20% {
      transform: translateX(-6px);
    }
    40% {
      transform: translateX(6px);
    }
    60% {
      transform: translateX(-4px);
    }
    80% {
      transform: translateX(4px);
    }
  }
</style>
