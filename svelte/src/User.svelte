<script type="text/javascript">
    const profileButtons = ["chat", "friend", "theme", "images", "videos", "music"];

    export let api;
    export let lang;
    export let dict;
    export let path;
    export let params;

    let profile;
    let bio;

    fetch(`${location.pathname}/${api.files.profile}`)
        .then(res => res.json())
        .then(res => profile = res);

    fetch(`${location.pathname}/${api.files.bio}`)
        .then(res => res.text())
        .then(res => bio = res);
</script>

{#if profile}
    <div id="profile">
        {#if profile.cover}
            <img
                src="{`${location.pathname}/${api.paths.images}/${api.default.album}/${profile.cover}`}"
                alt="" id="profile-cover" />
        {/if}

        <h1 id="profile-name">{profile.name ? profile.name : dict.profile.user.default.name}</h1>

        {#if profile.avatar}
            <img src="{`${location.pathname}/${api.paths.images}/${api.default.album}/${profile.avatar}`}"
                alt="" class="image" id="profile-avatar" />
        {:else}
            <img src="img/avatar.png" alt="" id="profile-avatar" />
        {/if}

        <div id="profile-buttons">
            {#each profileButtons as button}
                <button class="profile-button" id="profile-{button}">{dict.profile.user.buttons[button]}</button>
            {/each}
        </div>

        {#if bio === undefined}
            <p class="preloader">{dict.preloader}</p>
        {:else}
            <div id="profile-bio">{bio ? bio : dict.profile.user.default.bio}</div>
        {/if}
    </div>
{:else}
    <p class="preloader">{dict.preloader}</p>
{/if}
