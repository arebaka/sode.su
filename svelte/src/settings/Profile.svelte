<script type="text/javascript">
    export let api;
    export let dict;
    export let me;

    let profile = {...me};
    let responses = {
        username: null,
        name:     null,
        bio:      null
    };

    fetch(`@${me.id}/${api.files.bio}`)
        .then(res => res.text())
        .then(res => profile.bio = me.bio = res);

    function changeUsername()
    {
        responses.username = null;
        if (me.username == profile.username) return;

        if (!/^[A-Za-z_][A-Za-z0-9_\-\.]*$/.test(profile.username))
            return responses.username = api.errors.invalid_data;
        if (profile.username.length < api.limits.username_min_length)
            return responses.username = api.errors.too_short;
        if (profile.username.length > api.limits.username_max_length)
            return responses.username = api.errors.too_long;

        if (!responses.username) {
            fetch(api.methods.settings.profile, {
                    method:  "POST",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify({ username: profile.username })
                })
                .then(res => res.json())
                .then(res => {
                    responses.username = res.status;
                    if (!responses.username) {
                        me.username = profile.username;
                    }
                });
        }
    }

    function changeName()
    {
        responses.name = null;
        if (me.name == profile.name) return;

        if (!profile.name)
            return responses.name = api.errors.required;
        if (profile.name.length > api.limits.name_max_length)
            return responses.name = api.errors.too_long;

        if (!responses.name) {
            fetch(api.methods.settings.profile, {
                    method:  "POST",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify({ name: profile.name })
                })
                .then(res => res.json())
                .then(res => {
                    responses.name = res.status;
                    if (!responses.name) {
                        me.name = profile.name;
                    }
                });
        }
    }

    function changeBio()
    {
        responses.bio = null;
        if (me.bio == profile.bio) return;

        if (profile.bio.length > api.limits.bio_max_length)
            return responses.bio = api.errors.too_long;

        if (!responses.bio) {
            fetch(api.methods.settings.profile, {
                    method:  "POST",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify({ bio: profile.bio })
                })
                .then(res => res.json())
                .then(res => {
                    responses.bio = res.status;
                    if (!responses.bio) {
                        me.bio = profile.bio;
                    }
                });
        }
    }

    function checkUsername()
    {
        responses.username = null;

        if (!/^[A-Za-z_][A-Za-z0-9_\-\.]*$/.test(profile.username))
            return responses.username = api.errors.invalid_data;
        if (profile.username.length < api.limits.username_min_length)
            return responses.username = api.errors.too_short;
        if (profile.username.length > api.limits.username_max_length)
            return responses.username = api.errors.too_long;
    }

    function checkName()
    {
        responses.name = null;

        if (!profile.name)
            return responses.name = api.errors.required;
        if (profile.name.length > api.limits.name_max_length)
            return responses.name = api.errors.too_long;
    }

    function checkBio()
    {
        responses.bio = null;

        if (profile.bio.length > api.limits.bio_max_length)
            return responses.bio = api.errors.too_long;
    }
</script>

{#if profile && profile.bio !== undefined}
    <form method="POST" action="{api.methods.settings.profile.all}" enctype="multipart/form-data"
            class="settings-form" id="settings-profile">
        <label class="settings-profile-option" id="settings-profile-username-box" class:error={responses.username}>
            {dict.settings.profile.username.title}
            <span class="settings-profile-option-descr" id="settings-profile-username-descr">
                {dict.settings.profile.username.descr}
            </span>
            <input type="text" name="username" placeholder="{dict.settings.profile.username.placeholder}"
                id="settings-profile-username" bind:value={profile.username} on:blur={changeUsername} on:change={checkUsername}
                on:keydown={checkUsername} on:keyup={checkUsername} on:pase={checkUsername} on:cut={checkUsername}/>
            {#if responses.username !== null}
                <p class="settings-response" id="settings-profile-username-response">
                    {dict.settings.profile.username.responses[Object.keys(api.errors).find(key => api.errors[key] == responses.username)]}
                </p>
            {/if}
        </label>
        <label class="settings-profile-option" id="settings-profile-name-box" class:error={responses.name}>
            {dict.settings.profile.name.title}
            <span class="settings-profile-option-descr" id="settings-profile-name-descr">
                {dict.settings.profile.name.descr}
            </span>
            <input type="text" name="name" placeholder="{dict.settings.profile.name.placeholder}"
                id="settings-profile-name" bind:value={profile.name} required on:blur={changeName} on:change={checkName}
                on:keydown={checkName} on:keyup={checkName} on:pase={checkName} on:cut={checkName}/>
            {#if responses.name !== null}
                <p class="settings-response" id="settings-profile-name-response">
                    {dict.settings.profile.name.responses[Object.keys(api.errors).find(key => api.errors[key] == responses.name)]}
                </p>
            {/if}
        </label>
        <label class="settings-profile-option" id="settings-profile-bio-box" class:error={responses.bio}>
            {dict.settings.profile.bio.title}
            <span class="settings-profile-option-descr" id="settings-profile-bio-descr">
                {dict.settings.profile.bio.descr}
            </span>
            <textarea name="bio" placeholder="{dict.settings.profile.bio.placeholder}"
                id="settings-profile-bio" bind:value={profile.bio} on:blur={changeBio} on:change={checkBio}
                on:keydown={checkBio} on:keyup={checkBio} on:pase={checkBio} on:cut={checkBio}></textarea>
            {#if responses.bio !== null}
                <p class="settings-response" id="settings-profile-bio-response">
                    {dict.settings.profile.bio.responses[Object.keys(api.errors).find(key => api.errors[key] == responses.bio)]}
                </p>
            {/if}
        </label>
    </form>
{:else}
    <p class="preloader">{dict.preloader}</p>
{/if}