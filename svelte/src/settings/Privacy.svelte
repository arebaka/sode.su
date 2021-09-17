<script type="text/javascript">
	import { api, dict, me } from "../store";

	const options = ["friendable", "invitable"];
	const flags   = ["searchable"];

	let profile   = {...$me};
	let responses = {
		friendable: null,
		invitable:  null,
		searchable: null
	};

	document.title = $dict.settings.privacy.title;

	function change(option)
	{
		responses[option] = null;
		if ($me[option] == profile[option]) return;

		if (profile[option] == null || profile[option] == undefined) {
			responses[option] = $api.errors.missing_param;
		}

		if (!responses[option]) {
			fetch($api.methods["set.privacy"].path, {
					method:  "POST",
					headers: { "Content-Type": "application/json" },
					body:    JSON.stringify({
						friendable: profile.friendable,
						invitable:  profile.invitable,
						searchable: profile.searchable
					})
				})
				.then(res => res.json())
				.then(res => {
					responses[option] = res.status;
					if (!responses[option]) {
						$me[option] = profile[option];
					}
				});
		}
	}
</script>

{#if profile}
	<form method="POST" action="{$api.methods["set.privacy"].path}" enctype="multipart/form-data"
			class="settings-form" id="settings-privacy">
		{#each options as option}
			<label class="settings-privacy-box" id="settings-privacy-{option}-box" class:error={responses[option]}>
				{$dict.settings.privacy[option].label}
				<select name="{option}" class="settings-privacy-option" id="settings-privacy-{option}"
						bind:value={profile[option]} required on:change={() => { change(option) }}>
					<option value="private" class="settings-privacy-{option}" selected={profile[option] == "private"}>
						{$dict.settings.privacy[option].private}
					</option>
					<option value="protected" class="settings-privacy-{option}" selected={profile[option] == "protected"}>
						{$dict.settings.privacy[option].protected}
					</option>
					<option value="public" class="settings-privacy-{option}"selected={profile[option] == "public"}>
						{$dict.settings.privacy[option].public}
					</option>
				</select>
				{#if responses[option] !== null}
					<p class="settings-response" id="settings-privacy-{option}-response">
						{$dict.settings.privacy[option].responses[
							Object.keys($api.errors).find(key => $api.errors[key] == responses[option])
						]}
					</p>
				{/if}
			</label>
		{/each}
		<fieldset id="settings-privacy-flags">
			<legend id="settings-privacy-flags-legend">{$dict.settings.privacy.flags.headline}</legend>
			{#each flags as flag}
				<label class="settings-privacy-flag-box" id="settings-privacy-{flag}-box" class:error={responses[flag]}>
					{$dict.settings.privacy[flag].label}
					<input type="checkbox" name="{flag}" class="settings-privacy-flag"
						id="settings-privacy-{flag}" bind:checked={profile[flag]} required
						on:change={() => change(flag)}/>
					{#if responses[flag] !== null}
						<p class="settings-response" id="settings-privacy-{flag}-response">
							{$dict.settings.privacy[flag].responses[
								Object.keys($api.errors).find(key => $api.errors[key] == responses[flag])
							]}
						</p>
					{/if}
				</label>
			{/each}
		</fieldset>
	</form>
{:else}
	<p class="preloader">{$dict.preloader}</p>
{/if}