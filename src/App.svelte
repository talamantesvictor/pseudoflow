<script>
   import Topbar from "./components/Topbar.svelte";
</script>
<Topbar />
<div id="wrapper">
   <div id="flowchart-area"></div>
   <div id="text-area">
      <div class="editor" contenteditable="true" spellcheck="false">
         hola
      </div>
   </div>
</div>
<style lang="scss">
   @import "./styles/variables.scss";

   #wrapper {
      height: calc(100% - $topbar-height);
      background: $editor-background;
      overflow: hidden;

      #text-area {
         width: 70%;
         background-color: $editor-background;
         height: calc(100vh - $topbar-height);
         overflow: scroll;

         .editor {
            outline: 0px solid transparent;
            min-height: calc(100% - 2rem);
            color: white;
            padding: 1rem;
         }
      }

      #flowchart-area {
         width: 30%;
         height: calc(100% - $topbar-height);
         background-color: $flowchart-background;
         position: absolute;
         right: 0;
      }
   }
</style>