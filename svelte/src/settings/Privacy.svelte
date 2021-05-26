<script type="text/javascript">
    const options = ["friendable", "invitable", "commentable"];
    const flags   = ["searchable", "anon_comments_only"];

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

    function change(option)
    {
        responses[option] = null;
        if (me[option] == profile[option]) return;

        if (!profile[option]) {
            responses[option] = api.errors.required;
        }

        if (!responses[option]) {
            fetch(api.methods.settings.privacy, {
                    method:  "POST",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify({ [option]: profile[option] })
                })
                .then(res => res.json())
                .then(res => {
                    responses[option] = res.status;
                    if (!responses[option]) {
                        me[option] = profile[option];
                    }
                });
        }
    }

    function changeFlag(flag)
    {
        responses[flag] = null;
        if (me[flag] == profile[flag]) return;

        if (!profile[flag]) {
            profile[flag] = false;
        }

        if (!responses[flag]) {
            fetch(api.methods.settings.privacy, {
                    method:  "POST",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify({ [flag]: profile[flag] })
                })
                .then(res => res.json())
                .then(res => {
                    responses[flag] = res.status;
                    if (!responses[flag]) {
                        me[flag] = profile[flag];
                    }
                });
        }
    }
</script>

{#if profile}
    <form method="POST" action="{api.methods.settings.privacy.all}" enctype="multipart/form-data"
            class="settings-form" id="settings-privacy">
        {#each options as option}
            <label class="settings-privacy-box" id="settings-privacy-{option}-box" class:error={responses[option]}>
                {dict.settings.privacy[option].title}
                <select name="{option}" class="settings-privacy-option" id="settings-privacy-{option}"
                        bind:value={profile[option]} required on:change={() => { change(option) }}>
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
                {#if responses[option] !== null}
                    <p class="settings-response" id="settings-privacy-{option}-response">
                        {dict.settings.privacy[option].responses[Object.keys(api.errors).find(key => api.errors[key] == responses[option])]}
                    </p>
                {/if}
            </label>
        {/each}
        <fieldset id="settings-privacy-flags">
            <legend id="settings-privacy-flags-legend">{dict.settings.privacy.flags.title}</legend>
            {#each flags as flag}
                <label class="settings-privacy-flag-box" id="settings-privacy-{flag}-box">
                    {dict.settings.privacy[flag].title}
                    <input type="checkbox" name="{flag}" class="settings-privacy-flag"
                        id="settings-privacy-{flag}" bind:checked={profile[flag]} required
                        on:change={() => { changeFlag(flag) }}/>
                    {#if responses[flag] !== null}
                        <p class="settings-response" id="settings-privacy-{flag}-response">
                            {dict.settings.privacy[flag].responses[Object.keys(api.errors).find(key => api.errors[key] == responses[flag])]}
                        </p>
                    {/if}
                </label>
            {/each}
        </fieldset>
    </form>
{:else}
    <p class="preloader">{dict.preloader}</p>
{/if}