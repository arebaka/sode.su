<script type="text/javascript">
    const privacyOptions = ["friendable", "invitable", "commentable"];

    export let api;
    export let dict;
    export let me;

    let profile   = {...me};
    let responses = {
        friendable:         null,
        invitable:          null,
        commentable:        null,
        searchable:         null,
        anon_comments_only: null
    };
</script>

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