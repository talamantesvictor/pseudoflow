import { writable, derived } from 'svelte/store';
import type { PffMeta } from './pff';
import englishWords from "../i18n/code/en.json";
import spanishWords from "../i18n/code/es.json";
import englishTranslations from "../i18n/app/en.json";
import spanishTranslations from "../i18n/app/es.json";
import { chartPalettes } from './themes';

declare const __APP_VERSION__: string;
declare const __FORMAT_VERSION__: string;
declare const __MIN_FORMAT_VERSION__: string;

function stored(key: string, fallback: string): string {
   if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key) || fallback;
   }
   return fallback;
}

function storedBool(key: string, fallback: boolean): boolean {
   if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem(key);
      return val !== null ? val === 'true' : fallback;
   }
   return fallback;
}

export let codeWordLang = stored('pseudoflow-code-lang', 'en');
export let translationLang = stored('pseudoflow-translation', 'en');
export let isFlowchartVisible = storedBool('pseudoflow-flowchart', true);
export let syntaxErrorsEnabled = storedBool('pseudoflow-syntax', true);
export let semanticErrorsEnabled = storedBool('pseudoflow-semantic', true);
export let themeId = stored('pseudoflow-theme', 'dracula');
export const APP_VERSION: string = __APP_VERSION__;
export const FORMAT_VERSION: string = __FORMAT_VERSION__;
export const MIN_FORMAT_VERSION: string = __MIN_FORMAT_VERSION__;
export const defaultName = 'pseudocode.pff';
export const fileNameStore = writable(defaultName);
export const pffMetaStore = writable<PffMeta | null>(null);
export const codeWordStore = writable(codeWordLang === 'es' ? spanishWords : englishWords);
export const translationStore = writable(translationLang === 'es' ? spanishTranslations : englishTranslations);
export const flowchartDrawingStore = writable(isFlowchartVisible);
export const syntaxErrorsStore = writable(syntaxErrorsEnabled);
export const semanticErrorsStore = writable(semanticErrorsEnabled);
export const errorStore = writable([]);
export const canUndoStore = writable(false);
export const canRedoStore = writable(false);
export const themeStore = writable(themeId);
export const chartPaletteStore = derived(themeStore, ($theme) => chartPalettes[$theme] || chartPalettes.dracula);

export const changeTranslation = (langCode) => {
   switch (translationLang = langCode) {
      case 'es':
         translationStore.set(spanishTranslations);
         break;
   
      default:
         translationStore.set(englishTranslations);
         break;
   }
   if (typeof localStorage !== 'undefined') {
      localStorage.setItem('pseudoflow-translation', langCode);
   }
};

export const changecodeWordsStore = (langCode) => {
   switch (codeWordLang = langCode) {
      case 'es':
         codeWordStore.set(spanishWords);
         break;
   
      default:
         codeWordStore.set(englishWords);
         break;
   }
   if (typeof localStorage !== 'undefined') {
      localStorage.setItem('pseudoflow-code-lang', langCode);
   }
};

export const changeFlowchartVisibility = (isVisible) => {
   isFlowchartVisible = isVisible;
   flowchartDrawingStore.set(isVisible);
   if (typeof localStorage !== 'undefined') {
      localStorage.setItem('pseudoflow-flowchart', String(isVisible));
   }
};

export const changeSyntaxErrors = (isEnabled) => {
   syntaxErrorsEnabled = isEnabled;
   syntaxErrorsStore.set(isEnabled);
   if (typeof localStorage !== 'undefined') {
      localStorage.setItem('pseudoflow-syntax', String(isEnabled));
   }
};

export const changeSemanticErrors = (isEnabled) => {
   semanticErrorsEnabled = isEnabled;
   semanticErrorsStore.set(isEnabled);
   if (typeof localStorage !== 'undefined') {
      localStorage.setItem('pseudoflow-semantic', String(isEnabled));
   }
};

export const changeTheme = (id: string) => {
   themeId = id;
   themeStore.set(id);
   if (typeof localStorage !== 'undefined') {
      localStorage.setItem('pseudoflow-theme', id);
   }
   if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = id;
   }
};