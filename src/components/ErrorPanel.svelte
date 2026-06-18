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
       background: $surface-background;
       border-top: 1px solid $border-color;
       padding: 0.8rem 1.5rem;
       min-height: 4rem;
       max-height: 40%;
       overflow-y: auto;
       flex-shrink: 0;
       box-sizing: border-box;
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
         background: $badge-syntax-bg;
         color: $badge-syntax-text;
      }

      &.semantic {
         background: $badge-semantic-bg;
         color: $badge-semantic-text;
      }
   }

   .line {
      color: $linenumbers-foreground;
      font-size: 0.75rem;
      flex-shrink: 0;
   }

   .message {
      color: var(--color-text-primary, white);
   }
</style>
