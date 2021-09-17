import { writable } from "svelte/store";

export let api          = writable();
export let dict         = writable();
export let me           = writable();
export let my           = writable();
export let toasts       = writable();
export let param        = writable();
export let confirmation = writable();
