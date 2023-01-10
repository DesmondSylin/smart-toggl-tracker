<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    import { saveNewEntry, sync } from './toggl';
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
        suggested_tags,
    }
    $: suggested_entries = makeSuggestion(exist_projects, suggested_tags);
    function makeSuggestion(projects, tags) {
        return projects.map(p => {
            return {
                description,
                project_id: p.id,
                tags,
            }
        })
    }

    function start(entry) {
        saveNewEntry(entry).then(() => sync());
        dispatch('selected', entry);
    }

</script>

<div id="smart-toggl-tracker-menulist">
    {#if exist_entries?.length}
    <h2>近期計時</h2>
    {#each exist_entries as entry }
        <div on:click={() => start(entry)} on:keydown={() => console.log('test')}>
            <EntryMenuItem entry={entry}></EntryMenuItem>
        </div>
    {/each}
    {/if}
    <h2>推薦計時</h2>
    <div>
        <input type="checkbox" bind:checked={use_tag} /> 是否使用標籤
    </div>
    {#each suggested_entries as entry }
        <div on:click={() => start(entry)} on:keydown={() => console.log('test')}>
            <EntryMenuItem entry={entry}></EntryMenuItem>
        </div>
    {/each}
    <div on:click={() => start(no_project_entry)} on:keydown={() => console.log('test')}>
        <EntryMenuItem entry={no_project_entry}></EntryMenuItem>
    </div>
</div>

<style>
    h2 {
        margin-bottom: 0.5rem;
    }
</style>