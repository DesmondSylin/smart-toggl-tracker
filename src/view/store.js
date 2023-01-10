import { writable } from 'svelte/store';

export const localStore = (key, initial) => {                 // receives the key of the local storage and an initial value
  const toString = (value) => {
    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    } else {
      return JSON.stringify(value, null, 2);
    }
  }  // helper function
  const toObj = JSON.parse                                    // helper function

  if (localStorage.getItem(`toggl-timer-${key}`) === null) {                   // item not present in local storage
    localStorage.setItem(`toggl-timer-${key}`, toString(initial))              // initialize local storage with initial value
  }

  let saved;
  try {
    saved = toObj(localStorage.getItem(`toggl-timer-${key}`))              // convert to object
  } catch {
    saved = localStorage.getItem(`toggl-timer-${key}`);
  }

  const { subscribe, set, update } = writable(saved)          // create the underlying writable store

  return {
    subscribe,
    set: (value) => {
      localStorage.setItem(`toggl-timer-${key}`, toString(value))              // save also to local storage as a string
      return set(value)
    },
    update
  }
}