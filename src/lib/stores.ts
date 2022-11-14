import { writable } from 'svelte/store';
import englishWords from "../i18n/code/en.json";
import spanishWords from "../i18n/code/es.json";
import englishTranslations from "../i18n/app/en.json";
import spanishTranslations from "../i18n/app/es.json";

export const _reservedWords = writable(englishWords);
export const translations = writable(englishTranslations);