import { writable } from 'svelte/store';
import reservedWords from "../i18n/code/es.json";

export const _reservedWords = writable(reservedWords);
export const _codeImport = writable();