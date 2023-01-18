<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    import { saveNewEntry, sync, is_debug } from '../lib/toggl';
    import EntryMenuItem from './EntryMenuItem.svelte';

    // export let modal;
    export let exist_entries = [];
    export let exist_projects = [];
    export let exist_tags = [];
    export let description = '';

    let use_tag = true;
    $: suggested_tags = use_tag ? exist_tags : [];
    $: no_project_entry = {
        description,
        tags: suggested_tags,
    }
    $: suggested_entries = makeSuggestion(exist_projects, suggested_tags);
    function makeSuggestion(projects, tags) {
        return projects.map(p => {
            return {
                description,
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
    <div>
        <input type="checkbox" bind:checked={use_tag} /> Use tag?
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
</style>