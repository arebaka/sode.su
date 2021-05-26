<script type="text/javascript">
    import { Router, Route, link } from "svelte-routing";

    import Error   from "./Error.svelte";
    import Profile from "./settings/Profile.svelte";
    import Privacy from "./settings/Privacy.svelte";

    const sections = ["profile", "privacy"];

    export let api;
    export let dict;
    export let me;
</script>

<Router>
    <div id="settings">
        <Route path="/">
            <h1 id="settings-header">{dict.settings.index.title}</h1>
            <p id="settings-descr">{dict.settings.index.descr}</p>
            <ul id="settings-sections">
                {#each sections as section}
                    <a href="{`${api.sections.settings}/${section}`}" class="settings-section" id="setting-section-{section}" use:link>
                        {dict.settings[section].title}
                    </a>
                {/each}
            </ul>
        </Route>
        <Route path="/:section" let:params>
            <a href="{api.sections.settings}" id="settings-back" use:link>{dict.settings.back}</a>
            <h1 id="settings-header">{dict.settings[params.section].title}</h1>
            <p id="settings-descr">{dict.settings[params.section].descr}</p>
            {#if params.section == "profile"}
                <Profile api={api} dict={dict} me={me}/>
            {:else if params.section == "privacy"}
                <Privacy api={api} dict={dict} me={me}/>
            {:else}
                <Error code={404}/>
            {/if}
        </Route>
    </div>
</Router>
