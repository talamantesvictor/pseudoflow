import { writable } from 'svelte/store';
import reservedWords from "../i18n/code/es.json";
import appTranslations from "../i18n/app/es.json";

export const _reservedWords = writable(reservedWords);

export const translations = () => {
   return appTranslations;
}