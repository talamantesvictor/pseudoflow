<script lang="ts">
   export let content: string;
</script>
<div id="output-content">
   {@html content}
</div>
<style lang="scss">
   #output-content {
      padding: 1rem;
      color: white;
   }
</style>