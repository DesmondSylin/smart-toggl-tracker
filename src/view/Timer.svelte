<script>
  import { onDestroy } from 'svelte';
  import Select from 'svelte-select/no-styles/Select.svelte';
  // import Select from 'svelte-select';
  import { is_offline, connect, projects, tags, entries, sync, token, saveNewEntry, saveOldEntry, stopTogglTimer, is_debug} from '../lib/toggl';
  import { formatTime, caculateDuration} from '../lib/tool';
  import { moment } from "obsidian";

  // 編輯類參數
  let new_token = "";
  export let description = '';
  export let select_project;
  export let select_tags;
  export let start = '';
  export let stop = '';
  let cruuent_duration = '';
  let is_editing = false;
  let editing_entry_id = 0;
  let timer_id = 0;
  let all_week_duration = 0;
  let is_loading = false;

  // 時間列表
  $: projects_dict = new Map($projects.map(p => [p.id, p]));
  $: running_entry = $entries.find(entry => !entry?.stop);
  $: days = makeDayEntries($entries);
  $: all_tags = $tags.map(tag => tag.name);
  $: {
    if (timer_id && !running_entry) {
      clearInterval(timer_id);
      cruuent_duration = '';
      timer_id = 0;
    } else if (!timer_id && running_entry) {
      timer_id = setInterval(() => {
        if (!running_entry) {
          cruuent_duration = "";
          return;
        } else {
          const begin = new Date(running_entry.start);
          const now = new Date();
          cruuent_duration = formatTime(now.valueOf() - begin.valueOf());;
        }
      }, 1000);
    }
  }
  onDestroy(() => clearInterval(timer_id));

  export function setTimerFromSelection(this_description, project_names = []) {
    let project;
    if (project_names.length) {
      for (const project_name of project_names) {
        const raw_project = $projects.find(p => p.name === project_name);
        if (raw_project) project = raw_project;
      }
    }
    editEntry({
      description: this_description,
      project_id: project ? project.id : undefined
    });
  }

  function makeDayEntries(entries) {
    const days = [];
    for (const entry of entries) {
      if (!entry?.stop) continue;
      const date = new Date(entry.start).toLocaleDateString();
      if (!days.find(day => day.date == date)) {
        days.push({date, entries: [], total: 0});
      }
      const this_day = days.find(day => day.date == date);
      this_day.entries.push(entry);
      if (entry.duration > 0) {
        this_day.total += entry.duration;
        all_week_duration += entry.duration;
      }
    }
    return days;
  }

  // 功能函式
  function resetFields() {
    /**
     * 清空欄位
    */
    description = '';
    select_project = {};
    select_tags = [];
    start = '';
    stop = '';
    editing_entry_id = 0;
  }

  async function saveTimer() {
    /**
     * 儲存計時
     */
    const payload = {
      description: description,
      tags: []
    };
    if (editing_entry_id) payload['id'] = editing_entry_id;
    if (select_project?.id) payload['project_id'] = select_project.id;
    if (select_tags && select_tags.length ) {
      payload['tags'] = select_tags.map(tag => tag.value);
    }
    // 時間設定
    if (start) {
      payload['start'] = new Date(start).toISOString();
    }
    if (stop) {
      payload['stop'] = new Date(stop).toISOString();
    }

    if (editing_entry_id) {
      await saveOldEntry(payload);
    } else {
      await saveNewEntry(payload);
    }
    sync();
    resetFields();
    is_editing = false;
  }

  async function stopTimer() {
    /**
     * 停止計時
    */
    await stopTogglTimer();
    await sync();
  }
  async function editEntry(entry) {
    description = entry.description ? entry.description : '';
    select_project = entry.project_id ? $projects.find(p => p.id == entry.project_id) : undefined;
    select_tags = entry.tags ? entry.tags : [];
    editing_entry_id = entry.id ? entry.id : 0;
    if (entry?.start) {
      start = moment(entry.start).format("YYYY-MM-DDTHH:mm:ss");
    } else {
      start = moment().format("YYYY-MM-DDTHH:mm:ss");
    }
    if (entry?.stop) {
      stop = moment(entry.stop).format("YYYY-MM-DDTHH:mm:ss");
    }
    is_editing = true;
  }

  async function startTimer() {
    /**
     * 啟動空白計時
     */
    const entry = await saveNewEntry({description: ''});
    await sync();
    editEntry(entry);
  }

  function startOldTimer(entry) {
    /**
     * 重複舊的計時
     */
    const payload = {
      description: entry.description,
      project_id: entry.pid || entry.project_id,
      tags: entry.tags
    };
    return saveNewEntry(payload).then(() => sync());
  }

  function cancalTimerEditing() {
    resetFields();
    is_editing = false;
  }

  // 輔助函式
  function checkToken() {
    connect(new_token);
  }
  function logout() {
    token.set("");
  }
  function syncData() {
    is_loading = true;
    sync().finally(() => is_loading = false);
  }
</script>

<div id="smart-toggl-tracker-timer" class="smart-toggl-tracker">
  <div class="container">
    <!-- 初始狀態 -->
    {#if !$token}
      <!-- 初始化 -->
      <input type="text" placeholder="請輸入 toggl token" class="form-control w-100" bind:value={new_token}>
      <button on:click={checkToken} style="width: 100%">Connect</button>
    {:else if $is_offline}
      <div>No network</div>
      <button class="btn" on:click={sync} style="width: 100%">Reconnect</button>
    {:else}
      <!-- 計時器 -->
      <div class="running-timer">
        {#if running_entry}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="timer-detail" on:click={editEntry(running_entry)}>
          <div>{running_entry.description ? running_entry.description : '(no description)'}</div>
          {#if running_entry.project_id && projects_dict.get(running_entry.project_id)}
            <div style={`color:${projects_dict.get(running_entry.project_id).color}`}>● {projects_dict.get(running_entry.project_id).name}</div>
          {/if}
        </div>
        <div class="timer-clock">
          {cruuent_duration}
        </div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="running-timer-stop" on:click={stopTimer}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
            <path fill-rule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clip-rule="evenodd" />
          </svg>
        </div>
        {:else}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="timer-empty" on:click={() => is_editing = !is_editing}>
          <div>Start a new timer</div>
        </div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="running-timer-stop" on:click={startTimer}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
            <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
          </svg>
        </div>
        {/if}
      </div>
      <hr />
      <!-- 計時器編輯台 -->
      {#if is_editing}
      <div class="timer-editing">
        {#if !editing_entry_id}
          <h4>New Timer</h4>
        {:else}
          <h4>Editing Timer</h4>
        {/if}
        <input
          type="text"
          class="form-control"
          bind:value={description}
          placeholder="Description"
        />
        <div class="space-bottom">
          <Select
            class="select-field"
            items={$projects}
            bind:value={select_project}
            label="name"
            itemId="id"
            showChevron="true"
            placeholder="Select a project"
          >
            <div slot="selection" let:selection let:index>
              <span style={`color:${selection.color}`}>● {selection.name}</span>
            </div>
            <div slot="item" let:item let:index>
              <span style={`color:${item.color}`}>● {item.name}</span>
            </div>
          </Select>
        </div>
        <div class="space-bottom">
          <Select
            class="select-field"
            items={all_tags}
            bind:value={select_tags}
            placeholder="Select a tag"
            showChevron="true"
            multiple="true"
            listOpen="true"
          >
            <div slot="item" let:item>
              {item.created ? 'Add new: ' : ''}
              {item.label}
            </div>
          </Select>
        </div>
        <div class="field-datetime">
          <label for="field-start">Since:</label>
          <input id="field-start" type="datetime-local" step="1" bind:value={start}>
        </div>
        <div class="field-datetime">
          <label for="field-end">Stop at:</label>
          <input id="field-end" type="datetime-local" step="1" bind:value={stop}>
        </div>
        <div class="btns">
          <button class="btn" on:click={cancalTimerEditing}>Cancel</button>
          <button class="btn" on:click={saveTimer}>Save</button>
        </div>
      </div>
      {/if}
      <div style="display:flex;margin-top: 1rem">
        {#if !is_loading}
          <button class="btn w-100" on:click={syncData}>Sync</button>
        {:else}
          <span>同步中...</span>
        {/if}
      </div>

      <!-- 除錯訊息區 -->
      {#if $is_debug}
        <div>Description : {description ? description : '(no description)'}</div>
        <div>Select Project ID : {select_project ? select_project.name : ''}</div>
        <div>Select tags :{select_tags ? JSON.stringify(select_tags.map(tag => tag.value)) : ''}</div>
        <div>Start: {start}</div>
        <div>Stop: {stop}</div>
      {/if}

      <!-- 近期計時列表 -->
      <hr />
      <div class="list-entries">
        {#if days?.length > 0}
          <div>THIS WEEK: {formatTime(all_week_duration, false)}</div>
          {#each days as day}
            <div class="day">
              <div class="day-detail">
                <div>{day.date}</div>
                <div class="day-detail-total">{formatTime(day.total, false)}</div>
              </div>
              {#each day.entries as entry}
              <div class="entry">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div class="entry-detail" on:click={editEntry(entry)}>
                  <div>{entry.description ? entry.description : '(no description)'}</div>
                  {#if entry.project_id}
                  <div style={`color:${projects_dict.get(entry.project_id)?.color}`}>● {projects_dict.get(entry.project_id)?.name}</div>
                  {/if}
                  {#if entry.tags}
                  <div>
                    {#each entry.tags as tag }
                    <small class="tag">#{tag}</small>
                    {/each}
                  </div>
                  {/if}
                </div>
                <div class="entry-duration">{caculateDuration(entry.start, entry.stop)}</div>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div class="btn-play" on:click={startOldTimer(entry)}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                    <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              {/each}
            </div>
          {/each}
        {/if}
      </div>`
    {/if}
  </div>
</div>


<style>
  input {
    box-sizing: border-box;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    --primary-bg-color: rgb(49, 44, 75);
  }
  .space-bottom {
    margin-bottom: 0.2rem;
  }
  .field-datetime label{
    display: block;
  }
  .field-datetime input{
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .list-entries{
    margin-top: 1rem;
  }
  .entry-duration {
    margin-left: auto;
  }
  .entry:hover .btn-play {
    opacity: 1;
  }
</style>
