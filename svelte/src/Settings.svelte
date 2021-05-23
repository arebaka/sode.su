<script type="text/javascript">
    const sections       = ["profile", "privacy"];
    const privacyOptions = ["friendable", "invitable", "commentable"];

    export let api;
    export let lang;
    export let dict;
    export let params;

    let profile;
    let bio;
    let section = location.pathname == `/${api.sections.settings}`
        ? null : location.pathname.split('/')[location.pathname.split('/').length - 1];

    $: (section, history.pushState(null, null, `${api.sections.settings}${section ? ("/" + section) : ""}`));

    fetch(api.methods.me, { method: "POST" })
        .then(res => res.json())
        .then(res => {
            if (res.status == api.errors.ok) {
                profile = res.data;
            } else {
                history.back();
            }
        })
        .then(() => {
            fetch(`@${profile.id}/${api.files.bio}`)
                .then(res => res.text())
                .then(res => bio = res);
        });
</script>

<div id="settings">
    {#if section}
        <button id="settings-back" on:click={() => { section = null }}>{dict.settings.back}</button>
    {/if}
    <h1 id="settings-header">{section ? dict.settings[section].title : dict.settings.index.title}</h1>
    <p id="settings-descr">{section ? dict.settings[section].descr : dict.settings.index.descr}</p>
    {#if section == "profile"}
        {#if profile && bio !== undefined}
            <form method="POST" action="{api.methods.settings.profile}" enctype="multipart/form-data" class="settings-form" id="settings-profile">
                <label class="settings-profile-option" id="settings-profile-username-box">
                    {dict.settings.profile.username.title}
                    <span class="settings-profile-option-descr" id="settings-profile-username-descr">{dict.settings.profile.username.descr}</span>
                    <input type="text" name="username" placeholder="{dict.settings.profile.username.placeholder}" id="settings-profile-username" bind:value={profile.username} />
                </label>
                <label class="settings-profile-option" id="settings-profile-name-box">
                    {dict.settings.profile.name.title}
                    <span class="settings-profile-option-descr" id="settings-profile-name-descr">{dict.settings.profile.name.descr}</span>
                    <input type="text" name="name" placeholder="{dict.settings.profile.name.placeholder}" id="settings-profile-name" bind:value={profile.name} required />
                </label>
                <label class="settings-profile-option" id="settings-profile-bio-box">
                    {dict.settings.profile.bio.title}
                    <span class="settings-profile-option-descr" id="settings-profile-bio-descr">{dict.settings.profile.bio.descr}</span>
                    <textarea name="bio" placeholder="{dict.settings.profile.bio.placeholder}" id="settings-profile-bio" bind:value={bio}></textarea>
                </label>
            </form>
        {:else}
            <p class="preloader">{dict.preloader}</p>
        {/if}
    {:else if section == "privacy"}
        {#if profile}
            <form method="POST" action="{api.methods.settings.privacy}" enctype="multipart/form-data" class="settings-form" id="settings-privacy">
                {#each privacyOptions as option}
                    <label class="settings-privacy-box" id="settings-privacy-{option}-box">
                        {dict.settings.privacy[option].title}
                        <select name="{option}" class="settings-privacy-option" id="settings-privacy-{option}" bind:value={profile[option]} required>
                            <option value="private" class="settings-privacy-{option}" selected={profile[option] == "private"}>{dict.settings.privacy[option].private}</option>
                            <option value="protected" class="settings-privacy-{option}" selected={profile[option] == "protected"}>{dict.settings.privacy[option].protected}</option>
                            <option value="public" class="settings-privacy-{option}"selected={profile[option] == "public"}>{dict.settings.privacy[option].public}</option>
                        </select>
                    </label>
                {/each}
                <fieldset id="settings-privacy-flags">
                    <legend id="settings-privacy-flags-legend">{dict.settings.privacy.flags.title}</legend>
                    <label class="settings-privacy-flag-box" id="settings-privacy-searchable-box">
                        {dict.settings.privacy.searchable.title}
                        <input type="checkbox" name="searchable" class="settings-privacy-flag" id="settings-privacy-searchable" bind:checked={profile.searchable} required />
                    </label>
                    <label class="settings-privacy-flag-box" id="settings-privacy-anon-comments-only-box">
                        {dict.settings.privacy.anon_comments_only.title}
                        <input type="checkbox" name="anon_comments_only" class="settings-privacy-flag" id="settings-privacy-anon-comments-only" bind:checked={profile.anon_comments_only} required />
                    </label>
                </fieldset>
            </form>
        {:else}
            <p class="preloader">{dict.preloader}</p>
        {/if}
    {:else}
        <ul id="settings-sections">
            {#each sections as s}
                <li class="settings-section" id="setting-section-{s}" on:click={() => { section = s }}>{dict.settings[s].title}</li>
            {/each}
        </ul>
    {/if}
</div>