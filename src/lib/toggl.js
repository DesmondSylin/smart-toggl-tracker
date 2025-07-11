import { requestUrl, Notice } from 'obsidian';

import { get } from 'svelte/store';
import { localStore } from './store';
export const projects = localStore("projects", []);
export const tags = localStore("tags", []);
export const clients = localStore("clients", []);
export const workspaces = localStore("workspaces", []);
export const entries = localStore("entries", []);
export const token = localStore('token', '');
export const workspace_id = localStore('workspace_id', 0);
export const is_offline = localStore('', false);
export const is_debug = localStore('', false);


const url = 'https://api.track.toggl.com';
function handleConnectError(err, payload) {
  console.log('Connect Error', err, payload);
  if (err?.status) {
    if (err.status == 429) {
      new Notice('Toggl has too many requests')
    } else if (err.status == 500) {
      new Notice('Toggl Service is shutdown');
    } else if (err.status == 403) {
      new Notice('Toggl token is not valid');
      logout();
    } else {
      new Notice(`Unknow Error: ${err.status}`);
    }
  } else {
    if (err.message === "net::ERR_NAME_NOT_RESOLVED") {
      new Notice(`Network is down`);
      is_offline.set(true);
    } else {
      new Notice(`Unknow Connect Error: ${err?.message}`);
    }
  }
  throw err;
}

async function fetchUrl(payload) {
  if (!payload?.headers) {
    payload['headers'] = {
      "Content-Type": "application/json",
      "Authorization": `Basic ${btoa(`${get(token)}:api_token`)}`
    }
  }
  return requestUrl(payload)
    .then(res => {
      is_offline.set(false);
      return res.json
    })
    .catch(error => handleConnectError(error, payload));
}


export function connect(new_token) {
  return fetchUrl({
    url: `${url}/api/v9/me`,
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${btoa(`${new_token}:api_token`)}`
    }
  }).then(res => {
    if (res?.default_workspace_id) {
      token.set(res.api_token);
      workspace_id.set(res.default_workspace_id);
      sync();
    }
    return res;
  });
}


export function getProjects() {
  return fetchUrl({
    url: `${url}/api/v9/me/projects`,
    method: 'GET'
  }).then(raw_projects => {
    projects.set(raw_projects)
    return raw_projects;
  });
}


export function getTags() {
  return fetchUrl({
    url: `${url}/api/v9/me/tags`,
    method: 'GET'
  }).then(raw_tags => {
    tags.set(raw_tags);
    return raw_tags
  });
}


export function getClients() {
  return fetchUrl({
    url: `${url}/api/v9/me/clients`,
    method: 'GET'
  }).then(raw_clients => {
    clients.set(raw_clients);
    return raw_clients
  });
}


export function getWorkspaces() {
  return fetchUrl({
    url: `${url}/api/v9/me/workspaces`,
    method: 'GET'
  }).then(raw_workspaces => {
    workspaces.set(raw_workspaces);
    return raw_workspaces
  });
}


export function getEntries() {
  const before = new Date();
  before.setDate(before.getDate()-7);
  before.setHours(0);
  before.setMinutes(0);
  before.setSeconds(0);

  return fetchUrl({
    url: `${url}/api/v9/me/time_entries?since=${Math.floor(before.valueOf() / 1000)}`,
    method: 'GET'
  }).then(raw_entries => {
    const new_entries = raw_entries.filter(entry => !entry.server_deleted_at).sort((a,b) => {
      if (a.start < b.start) return 1;
      if (a.start > b.start) return -1;
      return 0;
    });
    entries.set(new_entries);
    return new_entries;
  });
}


export function sync() {
  /**
   * 同步所有toggl資料
   */
  const this_token = get(token);
  if (!this_token) {
    console.error('尚未設定token');
    return;
  }
  return Promise.all([
    getProjects(),
    getClients(),
    getTags(),
    getWorkspaces(),
    getEntries()
  ]);
}


export function saveNewEntry(entry) {
  /**
   * 啟動計時器
   */
  const this_workspace_id = entry.workspace_id ? entry.workspace_id : get(workspace_id);
  const payload = {
    'description': entry.description,
    'start': entry?.start ? entry.start : '',
    'at': entry.start,
    'stop': entry?.stop ? entry.stop : null,
    'duration': entry?.duration ? entry.duration : null,
    'project_id': entry.project_id || null,
    'tags': entry.tags || null,
    'created_with': 'obsidian',
    'workspace_id': this_workspace_id
  };
  if (!payload.start) {
    const now = new Date();
    payload.start = now.toISOString();
    payload.at = now.toISOString();
  }
  const start = new Date(payload.start);
  if (payload.stop) {
    const stop = new Date(payload.stop);
    payload.duration = (stop.valueOf() - start.valueOf()) / 1000;
  } else{
    payload.duration = -1 * Math.floor(start.getTime() / 1000);
    payload.stop = null;
  }

  return fetchUrl({
    url: `${url}/api/v9/workspaces/${this_workspace_id}/time_entries`,
    method: 'POST',
    body:JSON.stringify(payload)
  });
}


export async function stopTogglTimer() {
  /**
   * 停止計時器
   */
  const current_timer = await fetchUrl({
    url: `${url}/api/v9/me/time_entries/current`,
    method: 'GET',
  });
  if (!current_timer?.id) return;
  return fetchUrl({
    url: `${url}/api/v9/workspaces/${current_timer.workspace_id}/time_entries/${current_timer.id}/stop`,
    method: 'PATCH'
  });
}


export async function saveOldEntry(entry) {
  /**
   * 修改舊有計時器
   */
  const this_token = get(token);
  const this_workspace_id = get(workspace_id);

  const payload = {...entry};
  payload['workspace_id'] = this_workspace_id;
  if (payload.start) {
    payload.at = payload.start;
  } else {
    const now = new Date();
    payload.start = now.toISOString();
    payload.at = now.toISOString();
  }
  const start = new Date(payload.start);
  if (payload.stop) {
    const stop = new Date(payload.stop);
    payload.duration = (stop.valueOf() - start.valueOf()) / 1000;
  } else{
    payload.duration = -1 * Math.floor(start.getTime() / 1000);
    payload.stop = null;
  }
  return fetchUrl({
    url: `${url}/api/v9/workspaces/${this_workspace_id}/time_entries/${entry.id}`,
    method: 'PUT',
    body: JSON.stringify(payload)
  })
}


export function checkCandidate({description, candidate_projects = []}) {
  // check exist entry
  const exist_toggl_entries = [];
  for (const entry of get(entries)) {
    if (entry.description === description) {
      if (
        !exist_toggl_entries.find(exist_entry =>
          exist_entry.description === description &&
          exist_entry.project_id === entry.project_id
        )
      ) {
        exist_toggl_entries.push(entry);
        if (exist_toggl_entries.length === 2) break;
      }
    }
  }
  // exist toggl project checked
  const exist_toggl_projects = [];
  for (const project_name of candidate_projects) {
    const this_project = get(projects).find(p => p.name === project_name);
    if (this_project && !exist_toggl_projects.find(p => p.id === this_project.id)) exist_toggl_projects.push(this_project);
    if(exist_toggl_projects.length === 5) break;
  }
  if (get(is_debug)) {
    console.log('驗證projects', candidate_projects, exist_toggl_projects);
    console.log('驗證entries', exist_toggl_entries);
  }
  return {
    exist_toggl_entries,
    exist_toggl_projects
  }
}


export function logout() {
  token.set('');
  projects.set([]);
  tags.set([]);
  clients.set([]);
  workspaces.set([]);
  entries.set([]);
  workspace_id.set(0);
}