<script type="text/javascript">
	import { Router, Route, link, navigate } from "svelte-routing";

	export let api;
	export let dict;
	export let me;
	export let ui;
	export let list;

	ui.active = "mutual";

	function updateNote(userId, text)
	{
		userId = parseInt(userId);
		list[userId].noteResponse = null;

		if (text == list[userId].note)
			return;
		if (text.length > api.types.Friend_Note.max_length)
			return list[userId].noteResponse = api.errors.too_long;

		if (!list[userId].noteResponse) {
			fetch(api.methods["friends.note"].path, {
					method:  "POST",
					headers: { "Content-Type": "application/json" },
					body:    JSON.stringify({ target: userId, text: text })
				})
				.then(res => res.json())
				.then(res => {
					list[userId].noteResponse = res.status;
					if (!list[userId].noteResponse) {
						list[userId].note         = text;
						list[userId].noteResponse = api.errors.ok;
					}
				});
		}
	}

	function checkNote(userId, text)
	{
		userId = parseInt(userId);
		list[userId].noteResponse = null;

		if (text == list[userId].note)
			return;
		if (text.length > api.types.Friend_Note.max_length)
			return list[userId].noteResponse = api.errors.too_long;
	}

	function updateAreaHeight(area)
	{
		area.style.height = "0px";
		area.style.height = area.scrollHeight + 2 + "px";
	}
</script>

<Router>
	{#if Object.keys(list).length}
		{#each Object.keys(list) as u}
			<li class="friends-user-box">
				<a class="friends-user" href="{api.paths["@*"]["/"].replace(":1", list[u].username || u)}" use:link>
					{#if list[u].avatar}
						<img class="friends-user-avatar"
							src="{api.paths["@*"].i["0"]["*." + list[u].avatar.split('.')[1]]
								.replace(":1", u)
								.replace(":2", list[u].avatar.split('.')[0])
								+ "?thumb=100"}"
							alt=""/>
					{:else}
						<p class="friends-user-avatar">{list[u].name[0] || dict.profile.user.default.name[0]}</p>
					{/if}
					<p class="friends-user-name">{list[u].name || dict.profile.user.default.name}</p>
					<p class="friends-user-username">@{list[u].username || u}</p>
					<button class="friends-user-button friends-user-button-negative" on:click|preventDefault|stopPropagation>
						{dict.friends[ui.active].buttons.negative}
					</button>
					<label class="friends-user-note-box" class:error={list[u].noteResponse} on:click|preventDefault|stopPropagation>
						<textarea placeholder="{dict.friends[ui.active].note.placeholder}" class="friends-user-note"
							on:blur={e => updateNote(u, e.target.value)} on:click={e => updateAreaHeight(e.target)}
							on:input={e => checkNote(u, e.target.value)} on:input={e => updateAreaHeight(e.target)}
						>{list[u].note}</textarea>
						{#if list[u].noteResponse !== null && list[u].noteResponse !== undefined}
							<p class="friends-user-note-response">
								{dict.friends[ui.active].note.responses[
									Object.keys(api.errors).find(key => api.errors[key] == list[u].noteResponse)
								]}
							</p>
						{/if}
					</label>
				</a>
			</li>
		{/each}
	{:else}
		<li id="friends-empty">{dict.friends[ui.active].empty}</li>
	{/if}
</Router>
