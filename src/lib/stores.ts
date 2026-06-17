import { writable } from 'svelte/store';
import type { PffMeta } from './pff';
import englishWords from "../i18n/code/en.json";
import spanishWords from "../i18n/code/es.json";
import englishTranslations from "../i18n/app/en.json";
import spanishTranslations from "../i18n/app/es.json";

declare const __APP_VERSION__: string;
declare const __FORMAT_VERSION__: string;
declare const __MIN_FORMAT_VERSION__: string;

export let codeWordLang = 'en';
export let translationLang = 'en';
export let isFlowchartVisible = true;
export let syntaxErrorsEnabled = true;
export let semanticErrorsEnabled = true;
export const APP_VERSION: string = __APP_VERSION__;
export const FORMAT_VERSION: string = __FORMAT_VERSION__;
export const MIN_FORMAT_VERSION: string = __MIN_FORMAT_VERSION__;
export const defaultName = 'pseudocode.pff';
export const fileNameStore = writable(defaultName);
export const pffMetaStore = writable<PffMeta | null>(null);
export const codeWordStore = writable(englishWords);
export const translationStore = writable(englishTranslations);
export const flowchartDrawingStore = writable(isFlowchartVisible);
export const syntaxErrorsStore = writable(syntaxErrorsEnabled);
export const semanticErrorsStore = writable(semanticErrorsEnabled);
export const errorStore = writable([]);
export const canUndoStore = writable(false);
export const canRedoStore = writable(false);

export const changeTranslation = (langCode) => {
   switch (translationLang = langCode) {
      case 'es':
         translationStore.set(spanishTranslations);
         break;
   
      default:
         translationStore.set(englishTranslations);
         break;
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
};

export const changeFlowchartVisibility = (isVisible) => {
   isFlowchartVisible = isVisible;
   flowchartDrawingStore.set(isVisible);
};

export const changeSyntaxErrors = (isEnabled) => {
   syntaxErrorsEnabled = isEnabled;
   syntaxErrorsStore.set(isEnabled);
};

export const changeSemanticErrors = (isEnabled) => {
   semanticErrorsEnabled = isEnabled;
   semanticErrorsStore.set(isEnabled);
};