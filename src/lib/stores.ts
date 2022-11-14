import { writable } from 'svelte/store';
import englishWords from "../i18n/code/en.json";
import spanishWords from "../i18n/code/es.json";
import englishTranslations from "../i18n/app/en.json";
import spanishTranslations from "../i18n/app/es.json";

export const codeWordStore = writable(spanishWords);
export const translationStore = writable(englishTranslations);

export const changeTranslation = (lanCode) => {
   switch (lanCode) {
      case 'es':
         translationStore.set(spanishTranslations);
         break;
   
      default:
         translationStore.set(englishTranslations);
         break;
   }
};

export const changecodeWordsStore = (lanCode) => {
   switch (lanCode) {
      case 'es':
         codeWordStore.set(spanishWords);
         break;
   
      default:
         codeWordStore.set(englishWords);
         break;
   }
};