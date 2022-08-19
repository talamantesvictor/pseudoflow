<script>
   import Topbar from "./components/Topbar.svelte";
</script>
<Topbar />
<div id="wrapper">
   <div id="text-area">

   </div>
   <div id="flowchart-area">

   </div>
</div>
<style lang="scss">
   @import "./styles/variables.scss";

   #wrapper {
      height: calc(100% - $topbar-height);
      background: $editor-background;
      overflow: hidden;
   }
</style>