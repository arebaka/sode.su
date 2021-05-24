<script type="text/javascript">
    import { Router, Route, link } from "svelte-routing";

    import Error from "./Error.svelte";

    const sections       = ["profile", "privacy"];
    const privacyOptions = ["friendable", "invitable", "commentable"];

    export let api;
    export let dict;
    export let me;

    let profile;
    let bio;
    let responses = {
        profile: {
            username: null,
            name:     null,
            bio:      null
        },
        privacy: {
            friendable:         null,
            invitable:          null,
            commentable:        null,
            searchable:         null,
            anon_comments_only: null
        }
    };

    $: profile = {...me};
    $: if (me) fetch(`@${me.id}/${api.files.bio}`)
        .then(res => res.text())
        .then(res => bio = res);

    function changeUsername()
    {
        if (me.username != profile.username) {
            if (!profile.username) {
                responses.profile.username = null;
            } else if (!/^[A-Za-z_][A-Za-z0-9_\-\.]*$/.test(profile.username)) {
                responses.profile.username = api.errors.invalid_data;
            } else if (profile.username.length < api.limits.username_min_length) {
                responses.profile.username = api.errors.too_short;
            } else  if (profile.username.length > api.limits.username_max_length) {
                responses.profile.username = api.errors.too_long;
            }

            if (!responses.profile.username) {
                fetch(api.methods.settings.profile.username, {
                        method:  "POST",
                        headers: { "Content-Type": "text/plain" },
                        body:    profile.username
                    })
                    .then(res => res.json)
                    .then(res => {
                        responses.profile.username = res.status;
                        me.profile.username = profile.username;
                    });
            }
        }
    }
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
                {#if profile && bio !== undefined}
                    <form method="POST" action="{api.methods.settings.profile.all}" enctype="multipart/form-data"
                          class="settings-form" id="settings-profile">
                        <label class="settings-profile-option" id="settings-profile-username-box"
                                class:error={responses.profile.username}>
                            {dict.settings.profile.username.title}
                            <span class="settings-profile-option-descr" id="settings-profile-username-descr">
                                {dict.settings.profile.username.descr}
                            </span>
                            <input type="text" name="username" placeholder="{dict.settings.profile.username.placeholder}"
                                id="settings-profile-username" bind:value={profile.username}
                                on:blur={changeUsername} />
                            {#if responses.profile.username !== null}
                                <p class="settings-response" id="settings-profile-username-response">
                                    {dict.settings.profile.username.responses["" + responses.profile.username]}
                                </p>
                            {/if}
                        </label>
                        <label class="settings-profile-option" id="settings-profile-name-box">
                            {dict.settings.profile.name.title}
                            <span class="settings-profile-option-descr" id="settings-profile-name-descr">
                                {dict.settings.profile.name.descr}
                            </span>
                            <input type="text" name="name" placeholder="{dict.settings.profile.name.placeholder}"
                                id="settings-profile-name" bind:value={profile.name} required />
                        </label>
                        <label class="settings-profile-option" id="settings-profile-bio-box">
                            {dict.settings.profile.bio.title}
                            <span class="settings-profile-option-descr" id="settings-profile-bio-descr">
                                {dict.settings.profile.bio.descr}
                            </span>
                            <textarea name="bio" placeholder="{dict.settings.profile.bio.placeholder}"
                                id="settings-profile-bio" bind:value={bio}></textarea>
                        </label>
                    </form>
                {:else}
                    <p class="preloader">{dict.preloader}</p>
                {/if}
            {:else if params.section == "privacy"}
                {#if profile}
                    <form method="POST" action="{api.methods.settings.privacy.all}" enctype="multipart/form-data"
                          class="settings-form" id="settings-privacy">
                        {#each privacyOptions as option}
                            <label class="settings-privacy-box" id="settings-privacy-{option}-box">
                                {dict.settings.privacy[option].title}
                                <select name="{option}" class="settings-privacy-option" id="settings-privacy-{option}"
                                        bind:value={profile[option]} required>
                                    <option value="private" class="settings-privacy-{option}" selected={profile[option] == "private"}>
                                        {dict.settings.privacy[option].private}
                                    </option>
                                    <option value="protected" class="settings-privacy-{option}" selected={profile[option] == "protected"}>
                                        {dict.settings.privacy[option].protected}
                                    </option>
                                    <option value="public" class="settings-privacy-{option}"selected={profile[option] == "public"}>
                                        {dict.settings.privacy[option].public}
                                    </option>
                                </select>
                            </label>
                        {/each}
                        <fieldset id="settings-privacy-flags">
                            <legend id="settings-privacy-flags-legend">{dict.settings.privacy.flags.title}</legend>
                            <label class="settings-privacy-flag-box" id="settings-privacy-searchable-box">
                                {dict.settings.privacy.searchable.title}
                                <input type="checkbox" name="searchable" class="settings-privacy-flag"
                                    id="settings-privacy-searchable" bind:checked={profile.searchable} required />
                            </label>
                            <label class="settings-privacy-flag-box" id="settings-privacy-anon-comments-only-box">
                                {dict.settings.privacy.anon_comments_only.title}
                                <input type="checkbox" name="anon_comments_only" class="settings-privacy-flag"
                                    id="settings-privacy-anon-comments-only" bind:checked={profile.anon_comments_only} required />
                            </label>
                        </fieldset>
                    </form>
                {:else}
                    <p class="preloader">{dict.preloader}</p>
                {/if}
            {:else}
                <Error code={404}/>
            {/if}
        </Route>
    </div>
</Router>
