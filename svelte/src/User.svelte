<script type="text/javascript">
	import Error from "./Error.svelte";
	import Wall  from "./Wall.svelte";

	export let api;
	export let dict;
	export let me;
	export let actions;
	export let my;
	export let descriptor;

	let profile;
	let bio;
	let relation;

	let ui = {
		buttons: {
			chat: {
				allowed: false,
				handler: () => {}
			},
			friend: {
				allowed: false,
				handler: () => {
					fetch(api.methods["friends.add"].path, {
							method: "POST",
							headers: {
								"Content-Type": "application/json"
							},
							body: JSON.stringify({ target: profile.id })
						})
						.then(res => res.json())
						.then(res => {
							if (res.status == api.errors.ok) {
								profile = profile;
								actions.showToast(
									dict.profile.user.toasts.friended.replace("{{name}}",profile.name),
									"success", 5000
								);
							}
						});
				}
			},
			theme: {
				allowed: true,
				handler: () => {}
			},
			images: {
				allowed: true,
				handler: () => {}
			},
			videos: {
				allowed: true,
				handler: () => {}
			},
			music: {
				allowed: true,
				handler: () => {}
			},
			unfriend: {
				allowed: false,
				handler: () => {
					let ctxDict  = {...dict.profile.user.confirmations.unfriend};
					ctxDict.text = ctxDict.text.replace("{{name}}", profile.name || dict.profile.user.default.name);

					actions.confirm(ctxDict, () => {
						fetch(api.methods["friends.remove"].path, {
								method: "POST",
								headers: {
									"Content-Type": "application/json"
								},
								body: JSON.stringify({ target: profile.id })
							})
							.then(res => res.json())
							.then(res => {
								if (res.status == api.errors.ok) {
									profile = profile;
									actions.showToast(
										dict.profile.user.toasts.unfriended.replace("{{name}}", profile.name),
										"success", 5000
									);
								}
							});
					}, () => {});
				}
			},
			unsubscribe: {
				allowed: false,
				handler: () => {
					fetch(api.methods["friends.remove"].path, {
							method: "POST",
							headers: {
								"Content-Type": "application/json"
							},
							body: JSON.stringify({ target: profile.id })
						})
						.then(res => res.json())
						.then(res => {
							if (res.status == api.errors.ok) {
								profile = profile;
								actions.showToast(
									dict.profile.user.toasts.unsubscribed
										.replace("{{name}}", profile.name || dict.profile.user.default.name),
									"success", 5000
								);
							}
						});
				}
			},
			ban: {
				allowed: false,
				handler: () => {}
			},
			unban: {
				allowed: false,
				handler: () => {}
			}
		}
	};

	$: if (descriptor) {
		fetch(api.paths["@*"].profile.replace(":1", descriptor))
			.then(res => res.status == 200 ? res.json() : null)
			.then(res => profile = res);

		fetch(api.paths["@*"].bio.replace(":1", descriptor))
			.then(res => res.status == 200 ? res.text() : null)
			.then(res => bio = res);
	}

	$: if (profile) {
		document.title = dict.profile.user.title
			.replace("{{name}}", profile.name || dict.profile.user.default.name);
	}

	$: if (profile && me) {
		fetch(api.methods.relation.path, {
				method:  "POST",
				headers: { "Content-Type": "application/json" },
				body:    JSON.stringify({ entity: "user/" + profile.id })
			})
			.then(res => res.json())
			.then(res => {
				relation = res.status == api.errors.ok
					? {...res.data, noteResponse: null} : null
			});
	}
	else {
		relation = null;
	}

	$: if (relation) {
		ui.buttons.friend.allowed = relation.relation == "incoming" || (
			relation.relation == "none" && (
				profile.friendable == "public" || (
					profile.friendable == "protected" && relation.common_friends > 0
		)));

		ui.buttons.unfriend.allowed    = relation.relation == "friend";
		ui.buttons.unsubscribe.allowed = relation.relation == "outcoming";
		ui.buttons.ban.allowed         = !relation.banned;
		ui.buttons.unban.allowed       = relation.banned;
	}
	else {
		ui.buttons.friend.allowed      =
		ui.buttons.unfriend.allowed    =
		ui.buttons.unsubscribe.allowed =
		ui.buttons.ban.allowed         =
		ui.buttons.unban.allowed       = false;
	}

	function escapeText(text)
	{
		return text
			.replace(/\&/g, "&lt;")
			.replace(/\</g, "&lt;")
			.replace(/\>/g, "&gt;")
			.replace(/\n/g, "<br />");
	}

	function updateNote(text)
	{
		relation.noteResponse = null;

		if (text == relation.note)
			return;
		if (text.length > api.types.Friend_Note.max_length)
			return relation.noteResponse = api.errors.too_long;

		fetch(api.methods["friends.note"].path, {
				method:  "POST",
				headers: { "Content-Type": "application/json" },
				body:    JSON.stringify({ target: profile.id, text: text })
			})
			.then(res => res.json())
			.then(res => {
				relation.noteResponse = res.status;
				if (relation.noteResponse == api.errors.ok) {
					relation.note = text;
				}
			});
	}

	function checkNote(text)
	{
		relation.noteResponse = null;

		if (text == relation.note)
			return;
		if (text.length > api.types.Friend_Note.max_length)
			return relation.noteResponse = api.errors.too_long;
	}

	document.getElementById("stylesheet").setAttribute("href", "css/user.css");  // TODO change
</script>

{#if profile}
	<div id="profile" class:banned={relation && relation.banned}
			data-relation="{relation ? relation.relation : "none"}">
		{#if profile.cover}
			<img src="{api.paths["@*"].i["0"]["*." + profile.cover.split('.')[1]]
					.replace(":1", profile.id)
					.replace(":2", profile.cover.split('.')[0])}"
				alt="" id="profile-cover" />
		{/if}

		<h1 id="profile-name">{profile.name || dict.profile.user.default.name}</h1>

		{#if profile.avatar}
			<img src="{api.paths["@*"].i["0"]["*." + profile.avatar.split('.')[1]]
					.replace(":1", profile.id)
					.replace(":2", profile.avatar.split('.')[0])
					+ "?thumb=1000"}"
				alt="" class="image" id="profile-avatar" />
		{:else}
			<img src="img/avatar.png" alt="" id="profile-avatar" />
		{/if}

		{#if relation}
			<div id="profile-relation">
				{#if relation.relation == "me"}
					<p id="profile-relation-me">{dict.profile.user.relation.relation.me}</p>
				{:else}
					<p class="profile-relation-line" id="profile-relation-relation">
						{dict.profile.user.relation.relation[relation.relation]}
					</p>
					<p class="profile-relation-line" id="profile-relation-common-friends" data-count={relation.common_friends}>
						{dict.profile.user.relation.common_friends[relation.relation]
							.replace("{{count}}", relation.common_friends)}
					</p>
					<p class="profile-relation-line" id="profile-relation-common-clubs" data-count={relation.common_clubs}>
						{dict.profile.user.relation.common_clubs[relation.relation]
							.replace("{{count}}", relation.common_clubs)}
					</p>
					{#if relation.relation == "friend"}
						<label id="profile-relation-note-box" class:error={relation.noteResponse} on:click|preventDefault|stopPropagation>
							<textarea placeholder="{dict.profile.user.relation.note[relation.relation].placeholder}" id="profile-relation-note"
								on:blur={e => updateNote(e.target.value)} on:click={e => actions.updateAreaHeight(e.target)}
								on:input={e => checkNote(e.target.value)} on:input={e => actions.updateAreaHeight(e.target)}
							>{relation.note}</textarea>
							{#if relation.noteResponse !== null}
								<p id="profile-relation-note-response">
									{dict.profile.user.relation.note[relation.relation].responses[
										Object.keys(api.errors).find(key => api.errors[key] == relation.noteResponse)
									]}
								</p>
							{/if}
						</label>
					{/if}
				{/if}
			</div>
		{/if}

		<div id="profile-buttons">
			{#each Object.keys(ui.buttons) as button}
				{#if ui.buttons[button].allowed}
					<button class="profile-button" id="profile-button-{button}" on:click={ui.buttons[button].handler}>
						{dict.profile.user.buttons[button]}
					</button>
				{/if}
			{/each}
		</div>

		{#if bio === undefined}
			<p class="preloader">{dict.preloader}</p>
		{:else}
			<div id="profile-bio">{@html escapeText(bio || dict.profile.user.default.bio)}</div>
		{/if}
	</div>

	<Wall api={api} dict={dict} me={me} actions={actions} my={my} profile={profile} relation={relation}/>
{:else if profile === null}
	<Error code={404}/>
{:else}
	<p class="preloader">{dict.preloader}</p>
{/if}
