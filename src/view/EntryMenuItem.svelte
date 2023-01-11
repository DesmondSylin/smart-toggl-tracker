<script>
    import { projects } from '../lib/toggl';

    export let entry = {};
    $: project = entry?.project_id ? $projects.find(p => p.id == entry.project_id) : null;
</script>

<div class="entry">
    <div class="btn-play">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
            <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
        </svg>
    </div>
    <div class="detail">
        <div class="description">{ entry?.description ? entry.description : '(no description)' }</div>
        <div>
            {#if project}
                <span
                    class="project"
                    style={`color:${project.color}`}
                >
                    ● {project.name}
                </span>
            {/if}
            {#if entry?.tags?.length}
                {#each entry.tags as tag }
                    <small class="tag"># {tag}</small>
                {/each}
            {/if}
        </div>
    </div>
</div>

<style>
.entry {
    display: flex;
    cursor: pointer;
    align-items: center;
    padding: 0.5rem;
}
.entry:hover {
    background-color: var(--interactive-hover);
}
.entry .detail {
    margin-left: 0.5rem;
}
.entry .btn-play {
    width: 1.5rem;
    margin: 0 0.5rem;
}
.entry .description {
    font-size: 1.3rem;
    font-weight: bolder;
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
</style>