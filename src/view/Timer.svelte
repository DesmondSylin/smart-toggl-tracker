<script>
  import { onDestroy } from 'svelte';
  // import Select from 'svelte-select/no-styles/Select.svelte';
  import Select from 'svelte-select';
  import { is_offline, connect, projects, tags, entries, sync, token, saveNewEntry, saveOldEntry, stopTogglTimer} from '../lib/toggl';
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
      const date = entry.at.split('T')[0];
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
    console.log('new entry: ' , entry);
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

  // 輔助函式
  function checkToken() {
    connect(new_token);
  }
  function logout() {
    token.set("");
  }
</script>

<div>
  <div class="container">
    <!-- 初始狀態 -->
    {#if !$token}
      <!-- 初始化 -->
      <input type="text" placeholder="請輸入 toggl token" class="form-control" bind:value={new_token}>
      <button on:click={checkToken} style="width: 100%">Connect</button>
    {:else if $is_offline}
      <div>目前離線中</div>
      <button on:click={sync} style="width: 100%">Reconnect</button>
    {:else}
      <!-- 計時器 -->
      <div id="running-timer">
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

      <!-- 計時器編輯台 -->
      {#if is_editing}
      <div class="timer-editing">
        <input
          type="text"
          class="form-control space-bottom"
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
            placeholder="Select a project"
          ></Select>
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
      </div>
      <button id="btn-start" class="btn" on:click={saveTimer}>Save</button>
      {/if}
      <div style="display:flex;margin-top: 1rem">
        <button class="btn" on:click={sync}>同步</button>
        <button class="btn" on:click={logout}>登出帳號</button>
      </div>

      <!-- 除錯訊息區 -->
      <div>Description : {description ? description : '(no description)'}</div>
      <div>Select Project ID : {select_project ? select_project.name : ''}</div>
      <div>Select tags :{select_tags ? JSON.stringify(select_tags.map(tag => tag.value)) : ''}</div>
      <div>Start: {start}</div>
      <div>Stop: {stop}</div>

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
  #running-timer {
    display: flex;
    align-items: center;
    height: 3rem;
    background-color: var(--primary-bg-color);
    color: white;
  }
  .timer-detail, .timer-clock {
    padding: 0.5rem;
  }
  .timer-clock {
    margin-left: auto;
  }
  .timer-empty {
    display: flex;
    align-items: center;
    padding: 1rem;
    flex: 1 1;
  }
  .running-timer-stop {
    width: 3rem;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ff897a;
    cursor: pointer;
  }
  .running-timer-stop svg {
    width: 1.5rem;
  }
  .timer-editing {
    margin-top: 1rem;
  }
  input {
    padding: 1rem 0.5rem;
  }
  .form-control {
    box-sizing: border-box;
    width: 100%;
    margin-bottom: 0.5rem;
  }
  #btn-start {
    width: 100%;
    padding: 0.5rem 0;
  }
  .list-entries{
    margin-top: 1rem;
  }
  .entry {
    display: flex;
    align-items: center;
    border-top: 1px solid gray;
    padding: .7rem 0;
  }
  .entry .tag {
    background-color: var(--tag-background);
    border: var(--tag-border-width) solid var(--tag-border-color);
    border-radius: var(--tag-radius);
    color: var(--tag-color);
    font-size: var(--tag-size);
    text-decoration: var(--tag-decoration);
    padding: var(--tag-padding-y) var(--tag-padding-x);
    line-height: 1;
    margin-right: 0.5rem;
  }
  .btn {
    margin-right: 0.5rem;
  }
  .btn-play {
    width: 1rem;
    margin-left: 0.3rem;
    opacity: 0.1;
    cursor: pointer;
    transition: opacity 0.5s ease;
  }
  .btn-play svg {
    display: flex;
    color: rgb(255, 131, 131);
  }
  .day {
    border: 1px solid rgb(214, 214, 214);
    padding: 1rem;
    margin-top: 1rem;
  }
  .day-detail {
    display: flex;
    justify-content: space-between;
  }
  .day-detail-total {
    font-weight: 900;
  }
  .entry-duration {
    margin-left: auto;
  }
  .entry:hover .btn-play {
    opacity: 1;
  }
  :global(.select-field) {
    background: var(--background-modifier-form-field)!important;
    --multi-item-clear-icon-color: white;
    --item-hover-color: black;
  }
  :global(.select-field .multi-item) {
    background: var(--background-modifier-form-field)!important;
  }
  :global(.select-field .svelte-select-list) {
    background: var(--background-modifier-form-field)!important;
  }
  :global(.select-field input:focus) {
    box-shadow: none;
  }
  /*:global(.select-field input) {
    width: 100%;
  }
  :global(.select-field .svelte-select-list) {
      box-shadow: 0 2px 3px 0 rgba(44, 62, 80, 0.24);
      max-height: 50vh;
      overflow-y: auto;
      background: var(--primary-bg-color);
      position:  absolute;
      z-index: 2;
    }
  :global(.select-field .a11y-text) {
    z-index: 9999;
    border: 0px;
    clip: rect(1px, 1px, 1px, 1px);
    height: 1px;
    width: 1px;
    position: absolute;
    overflow: hidden;
    padding: 0px;
    white-space: nowrap;
  }*/
</style>
