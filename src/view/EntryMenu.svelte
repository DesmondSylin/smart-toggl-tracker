<script>
    import { basename } from 'path';
import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    import { saveNewEntry, sync, is_debug } from '../lib/toggl';
    import EntryMenuItem from './EntryMenuItem.svelte';
    const file = app.workspace.getActiveFile();

    // export let modal;
    export let exist_entries = [];
    export let exist_projects = [];
    export let exist_tags = [];
    export let description = '';

    let use_filename = false;
    let use_tag = true;
    $: suggested_tags = use_tag ? exist_tags : [];
    $: no_project_entry = {
        description: use_filename ? file.basename : description,
        tags: suggested_tags,
    }
    $: suggested_entries = makeSuggestion(exist_projects, suggested_tags, use_filename);
    function makeSuggestion(projects, tags, use_filename) {
        console.log(use_filename);
        console.log(file);
        return projects.map(p => {
            return {
                description: use_filename ? file.basename : description,
                project_id: p.id,
                tags,
            }
        });
    }

    function start(entry) {
        const payload = {
            description: entry.description,
            project_id: entry.project_id,
            tags: entry.tags,
            workspace_id: entry.workspace_id ? entry.workspace_id : null
        }
        saveNewEntry(payload).then(() => sync());
        dispatch('selected', entry);
    }

</script>

<div id="smart-toggl-tracker-menulist">
    {#if exist_entries?.length}
    <h2>Recently</h2>
    {#each exist_entries as entry }
        <div on:click={() => start(entry)} on:keydown={() => console.log('test')}>
            <EntryMenuItem entry={entry}></EntryMenuItem>
        </div>
    {/each}
    {/if}
    <h2>Recommand:</h2>
    <div class="checkline">
        {#if file.basename !== description}
        <div class="check"><input type="checkbox" bind:checked={use_filename} /> Use filename?</div>
        {/if}
        <div class="check"><input type="checkbox" bind:checked={use_tag} /> Use tag?</div>
    </div>
    {#each suggested_entries as entry }
        <div on:click={() => start(entry)} on:keydown={() => console.log('test')}>
            <EntryMenuItem entry={entry}></EntryMenuItem>
        </div>
    {/each}
        <div on:click={() => start(no_project_entry)} on:keydown={() => console.log('test')}>
            <EntryMenuItem entry={no_project_entry}></EntryMenuItem>
        </div>
    <!-- {#if $is_debug}
        <div>Exist Projects:{JSON.stringify(exist_projects)}</div>
        <div>Exist Tags:{JSON.stringify(exist_tags)}</div>
        <div>Exist Entries:{JSON.stringify(exist_entries)}</div>
    {/if} -->
</div>

<style>
    h2 {
        margin-bottom: 0.5rem;
    }
    .checkline {
        display: flex;
        flex-wrap: wrap;
    }
    .checkline .check {
        white-space:nowrap;
        margin-right: 1rem;
    }
</style>