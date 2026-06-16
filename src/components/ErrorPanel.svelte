<script lang="ts">
   import { errorStore, syntaxErrorsStore, semanticErrorsStore } from "../lib/stores";

   $: visibleErrors = $errorStore.filter(e =>
      (e.type === 'syntax' && $syntaxErrorsStore) ||
      (e.type === 'semantic' && $semanticErrorsStore)
   );
</script>

{#if visibleErrors.length > 0}
<div class="errors-panel">
   {#each visibleErrors as error}
   <div class="error-entry">
      <span class="badge" class:syntax={error.type === 'syntax'} class:semantic={error.type === 'semantic'}>
         {error.type === 'syntax' ? 'Syntax' : 'Semantic'}
      </span>
      {#if error.line}
      <span class="line">[Ln {error.line}]</span>
      {/if}
      <span class="message">{error.message}</span>
   </div>
   {/each}
</div>
{/if}

<style lang="scss">
   @use "../styles/variables.scss" as *;

   .errors-panel {
      background: #1C1F2D;
      border-top: 1px solid #3F4254;
      padding: 0.8rem 1.5rem;
      max-height: 40%;
      overflow-y: auto;
      flex-shrink: 0;
   }

   .error-entry {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.3rem 0;
      font-family: 'Roboto', Avenir, Helvetica, Arial, sans-serif;
      font-size: 0.85rem;
   }

   .badge {
      font-size: 0.7rem;
      font-weight: bold;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
      flex-shrink: 0;

      &.syntax {
         background: rgba(255, 112, 112, 0.2);
         color: #ff7070;
      }

      &.semantic {
         background: rgba(255, 210, 62, 0.2);
         color: #ffd23e;
      }
   }

   .line {
      color: $linenumbers-foreground;
      font-size: 0.75rem;
      flex-shrink: 0;
   }

   .message {
      color: white;
   }
</style>
