<script type="text/javascript">
	import Error from "./Error.svelte";

	const profileButtons = {
		chat: {
			handler: () => {}
		},
		friend: {
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
			handler: () => {}
		},
		images: {
			handler: () => {}
		},
		videos: {
			handler: () => {}
		},
		music: {
			handler: () => {}
		},
		unfriend: {
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
							dict.profile.user.toasts.unfriended.replace("{{name}}", profile.name),
							"success", 5000
						);
					}
				});
			}
		},
		unsubscribe: {
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
			handler: () => {}
		},
		unban: {
			handler: () => {}
		}
	};

	export let api;
	export let dict;
	export let me;
	export let actions;
	export let descriptor;

	let profile;
	let bio;
	let relation;

	$: if (descriptor) {
		fetch(api.paths["@*"]["profile.json"].replace(":1", descriptor))
			.then(res => res.status == 200 ? res.json() : null)
			.then(res => profile = res);

		fetch(api.paths["@*"]["bio"].replace(":1", descriptor))
			.then(res => res.status == 200 ? res.text() : null)
			.then(res => bio = res);
	}

	$: if (profile) {
		document.title = dict.profile.user.title
			.replace("{{name}}", profile.name || dict.profile.user.default.name);
	}

	$: if (profile && me) {
		fetch(api.methods.relation.path, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ entity: "user/" + profile.id })
			})
			.then(res => res.json())
			.then(res => { relation = res.status == api.errors.ok
				? {...res.data, noteResponse: null} : null
			});
	}
	else {
		relation = null;
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

		if (!relation.noteResponse) {
			fetch(api.methods["friends.note"].path, {
					method:  "POST",
					headers: { "Content-Type": "application/json" },
					body:    JSON.stringify({ target: profile.id, text: text })
				})
				.then(res => res.json())
				.then(res => {
					relation.noteResponse = res.status;
					if (!relation.noteResponse) {
						relation.note         = text;
						relation.noteResponse = api.errors.ok;
					}
				});
		}
	}

	function checkNote(text)
	{
		relation.noteResponse = null;

		if (text == relation.note)
			return;
		if (text.length > api.types.Friend_Note.max_length)
			return relation.noteResponse = api.errors.too_long;
	}

	function updateAreaHeight(area)
	{
		area.style.height = "0px";
		area.style.height = area.scrollHeight + 2 + "px";
	}
	
	document.getElementById("stylesheet").setAttribute("href", "css/user.css");  // TODO change
</script>

{#if profile}
	<div id="profile" class:banned={relation && relation.banned}
			data-relation="{relation ? relation.friend : "none"}">
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
				{#if relation.friend == "me"}
					<p id="profile-relation-me">{dict.profile.user.relation.me}</p>
				{:else}
					<p class="profile-relation-line" id="profile-relation-friend">
						{dict.profile.user.relation.friend[relation.friend]}
					</p>
					<p class="profile-relation-line" id="profile-relation-common-friends" data-count={relation.common_friends}>
						{dict.profile.user.relation.common_friends[relation.friend]
							.replace("{{count}}", relation.common_friends)}
					</p>
					<p class="profile-relation-line" id="profile-relation-common-clubs" data-count={relation.common_clubs}>
						{dict.profile.user.relation.common_clubs[relation.friend]
							.replace("{{count}}", relation.common_clubs)}
					</p>
					<label id="profile-relation-note-box" class:error={relation.noteResponse} on:click|preventDefault|stopPropagation>
						<textarea placeholder="{dict.profile.user.relation.note[relation.friend].placeholder}" id="profile-relation-note"
							on:blur={e => updateNote(e.target.value)} on:click={e => updateAreaHeight(e.target)}
							on:input={e => checkNote(e.target.value)} on:input={e => updateAreaHeight(e.target)}
						>{relation.note}</textarea>
						{#if relation.noteResponse !== null}
							<p id="profile-relation-note-response">
								{dict.profile.user.relation.note[relation.friend].responses[
									Object.keys(api.errors).find(key => api.errors[key] == relation.noteResponse)
								]}
							</p>
						{/if}
					</label>
				{/if}
			</div>
		{/if}

		<div id="profile-buttons">
			{#each Object.keys(profileButtons) as button}
				<button class="profile-button" id="profile-button-{button}" on:click={profileButtons[button].handler}>
					{dict.profile.user.buttons[button]}
				</button>
			{/each}
		</div>

		{#if bio === undefined}
			<p class="preloader">{dict.preloader}</p>
		{:else}
			<div id="profile-bio">{@html escapeText(bio || dict.profile.user.default.bio)}</div>
		{/if}
	</div>
{:else if profile === null}
	<Error code={404}/>
{:else}
	<p class="preloader">{dict.preloader}</p>
{/if}
