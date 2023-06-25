import { writable } from 'svelte/store';
import englishWords from "../i18n/code/en.json";
import spanishWords from "../i18n/code/es.json";
import englishTranslations from "../i18n/app/en.json";
import spanishTranslations from "../i18n/app/es.json";

export let codeWordLang = 'en';
export let translationLang = 'en';
export const defaultName = 'pseudocode.pff';
export const fileNameStore = writable(defaultName);
export const codeWordStore = writable(englishWords);
export const translationStore = writable(englishTranslations);
export const flowchartDrawingStore = writable(true);

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