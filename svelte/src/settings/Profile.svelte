<script type="text/javascript">
	import { api, dict, me } from "../store";
	import { updateAreaHeight } from "../tools";

	let section = "profile";

	let profile;
	let bio;
	let responses = {
		username: null,
		name:     null,
		bio:      null
	};

	document.title = $dict.settings.profile.title;

	$: if ($me) {
		fetch($api.paths["@*"].bio.replace(":1", $me.id))
			.then(res => res.text())
			.then(res => {
				bio     = res;
				profile = {...$me, bio: res};
			});
	}

	function updateUsername()
	{
		responses.username = null;

		if ($me.username == profile.username)
			return;
		if (!RegExp($api.types.Username.pattern).test(profile.username))
			return responses.username = $api.errors.invalid_data;
		if (profile.username.length < $api.types.Username.min_length)
			return responses.username = $api.errors.too_short;
		if (profile.username.length > $api.types.Username.max_length)
			return responses.username = $api.errors.too_long;

		fetch($api.methods["set.profile"].path, {
				method:  "POST",
				headers: { "Content-Type": "application/json" },
				body:    JSON.stringify({ username: profile.username })
			})
			.then(res => res.json())
			.then(res => {
				responses.username = res.status;
				if (!responses.username) {
					$me.username = profile.username;
				}
			});
	}

	function updateName()
	{
		responses.name = null;

		if ($me.name == profile.name)
			return;
		if (!profile.name.length)
			return responses.name = $api.errors.missing_param;
		if (profile.name.length > $api.types.Entity_Name.max_length)
			return responses.name = $api.errors.too_long;

		if (!responses.name) {
			fetch($api.methods["set.profile"].path, {
					method:  "POST",
					headers: { "Content-Type": "application/json" },
					body:    JSON.stringify({ name: profile.name })
				})
				.then(res => res.json())
				.then(res => {
					responses.name = res.status;
					if (!responses.name) {
						$me.name = profile.name;
					}
				});
		}
	}

	function updateBio()
	{
		responses.bio = null;

		if (bio == profile.bio)
			return;
		if (profile.bio.length > $api.types.Bio.max_length)
			return responses.bio = $api.errors.too_long;

		if (!responses.bio) {
			fetch($api.methods["set.profile"].path, {
					method:  "POST",
					headers: { "Content-Type": "application/json" },
					body:    JSON.stringify({ bio: profile.bio })
				})
				.then(res => res.json())
				.then(res => {
					responses.bio = res.status;
					if (!responses.bio) {
						bio = profile.bio;
					}
				});
		}
	}

	function checkUsername(username)
	{
		profile.username   = username;
		responses.username = null;

		if (!RegExp($api.types.Username.pattern).test(profile.username))
			return responses.username = $api.errors.invalid_data;
		if (profile.username.length < $api.types.Username.min_length)
			return responses.username = $api.errors.too_short;
		if (profile.username.length > $api.types.Username.max_length)
			return responses.username = $api.errors.too_long;
	}

	function checkName(name)
	{
		profile.name   = name;
		responses.name = null;

		if (!profile.name.length)
			return responses.name = $api.errors.missing_param;
		if (profile.name.length > $api.types.Entity_Name.max_length)
			return responses.name = $api.errors.too_long;
	}

	function checkBio(bio)
	{
		profile.bio   = bio;
		responses.bio = null;

		if (profile.bio.length > $api.types.Bio.max_length)
			return responses.bio = $api.errors.too_long;
	}
</script>

{#if profile}
	<form method="POST" action="{$api.methods["set.profile"].path}" enctype="multipart/form-data"
			class="settings-form" id="settings-profile">
		<label class="settings-profile-option" id="settings-profile-username-box" class:error={responses.username}>
			{$dict.settings.profile.username.label}
			<span class="settings-profile-option-descr" id="settings-profile-username-descr">
				{$dict.settings.profile.username.descr}
			</span>
			<input type="text" name="username" placeholder="{$dict.settings.profile.username.placeholder}"
				id="settings-profile-username" value="{profile.username}" on:blur={updateUsername}
				on:input={e => checkUsername(e.target.value)}/>
			{#if responses.username !== null}
				<p class="settings-response" id="settings-profile-username-response">
					{$dict.settings.profile.username.responses[
						Object.keys($api.errors).find(key => $api.errors[key] == responses.username)
					]}
				</p>
			{/if}
		</label>
		<label class="settings-profile-option" id="settings-profile-name-box" class:error={responses.name}>
			{$dict.settings.profile.name.label}
			<span class="settings-profile-option-descr" id="settings-profile-name-descr">
				{$dict.settings.profile.name.descr}
			</span>
			<input type="text" name="name" placeholder="{$dict.settings.profile.name.placeholder}"
				id="settings-profile-name" value="{profile.name}" required on:blur={updateName}
				on:input={e => checkName(e.target.value)}/>
			{#if responses.name !== null}
				<p class="settings-response" id="settings-profile-name-response">
					{$dict.settings.profile.name.responses[
						Object.keys($api.errors).find(key => $api.errors[key] == responses.name)
					]}
				</p>
			{/if}
		</label>
		<label class="settings-profile-option" id="settings-profile-bio-box" class:error={responses.bio}>
			{$dict.settings.profile.bio.label}
			<span class="settings-profile-option-descr" id="settings-profile-bio-descr">
				{$dict.settings.profile.bio.descr}
			</span>
			<textarea name="bio" placeholder="{$dict.settings.profile.bio.placeholder}" id="settings-profile-bio"
				on:blur={updateBio} on:input={e => checkBio(e.target.value)}
				on:click={e => updateAreaHeight(e.target)} on:input={e => updateAreaHeight(e.target)}
			>{profile.bio}</textarea>
			{#if responses.bio !== null}
				<p class="settings-response" id="settings-profile-bio-response">
					{$dict.settings.profile.bio.responses[
						Object.keys($api.errors).find(key => $api.errors[key] == responses.bio)
					]}
				</p>
			{/if}
		</label>
	</form>
{:else}
	<p class="preloader">{$dict.preloader}</p>
{/if}