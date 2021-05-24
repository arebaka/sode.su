<script type="text/javascript">
    const sections       = ["profile", "privacy"];
    const privacyOptions = ["friendable", "invitable", "commentable"];

    export let api;
    export let dict;
    export let me;

    let profile;
    let bio;
    let errors;
    let section = location.pathname == `/${api.sections.settings}`
        ? null : location.pathname.split('/')[location.pathname.split('/').length - 1];

    $: profile = {...me};
    $: me, me
        ? fetch(`@${me.id}/${api.files.bio}`)
            .then(res => res.text())
            .then(res => bio = res) : null;

    $: section, (() => {
        history.pushState(null, null, `${api.sections.settings}${section ? ("/" + section) : ""}`);

        errors = {
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

        fetch(api.methods.me, { method: "POST" })
            .then(res => res.json())
            .then(res => me = res.data);
    })();

    function changeUsername(username)
    {
        if (me.username != username) {
            if (!username) {
                errors.profile.username = null;
            } else if (!/[A-Za-z_][A-Za-z0-9_\-\.]*/.test(username)) {
                errors.profile.username = api.errors.invalid_data;
            } else if (username.length < api.limits.username_min_length) {
                errors.profile.username = api.errors.too_short;
            } else  if (username.length > api.limits.username_max_length) {
                errors.profile.username = api.errors.too_long;
            }

            if (!errors.profile.username) {
                fetch(api.methods.settings.profile.username, {
                        method: "POST",
                        headers: { "Content-Type": "text/plain" },
                        body: username
                    })
                    .then(res => res.json)
                    .then(res => {
                        errors.profile.username = res.status;
                    });
            }
        }
    }
</script>

<div id="settings">
    {#if section}
        <button id="settings-back" on:click={() => { section = null }}>{dict.settings.back}</button>
    {/if}
    <h1 id="settings-header">{section ? dict.settings[section].title : dict.settings.index.title}</h1>
    <p id="settings-descr">{section ? dict.settings[section].descr : dict.settings.index.descr}</p>
    {#if section == "profile"}
        {#if profile && bio !== undefined}
            <form method="POST" action="{api.methods.settings.profile.all}" enctype="multipart/form-data"
                    class="settings-form" id="settings-profile">
                <label class="settings-profile-option" id="settings-profile-username-box"
                        class:error={errors.profile.username}>
                    {dict.settings.profile.username.title}
                    <span class="settings-profile-option-descr" id="settings-profile-username-descr">
                        {dict.settings.profile.username.descr}
                    </span>
                    <input type="text" name="username" placeholder="{dict.settings.profile.username.placeholder}"
                        id="settings-profile-username" bind:value={profile.username}
                        on:blur={() => { changeUsername(profile.username) }} />
                    {#if errors.profile.username > 0}
                        <p class="settings-error" id="settings-profile-username-error">
                            {dict.settings.profile.username.errors["" + errors.profile.username]}
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
    {:else if section == "privacy"}
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
        <ul id="settings-sections">
            {#each sections as s}
                <li class="settings-section" id="setting-section-{s}" on:click={() => { section = s }}>
                    {dict.settings[s].title}
                </li>
            {/each}
        </ul>
    {/if}
</div>