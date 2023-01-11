import { openDB } from 'idb';
import { writable } from 'svelte/store';

let idb = openDB('smart-toggl-tracker', 1, {
  upgrade(db) {
    db.createObjectStore('cache');
  }
});

export const localStore = (key, initial) => {
  // init from cache
  const { subscribe, set, update } = writable(initial);

  if (key) {
    // 移除舊版快取
    if (localStorage.getItem(`toggl-timer-${key}`)) {
      localStorage.removeItem(`toggl-timer-${key}`);
    }

    idb.then(db =>
      db.get('cache', key).then(value => {
        if (value) set(value);
      }).catch(() => db.put('cache', initial, key))
    );
  } else {
    set(initial);
  }

  return {
    subscribe,
    set: (value) => {
      if (key) idb.then(db => db.put('cache', value, key));
      return set(value)
    },
    update
  }
}
