<script type="text/javascript">
	import { Router, Route, link, navigate } from "svelte-routing";

	export let api;
	export let dict;
	export let me;
	export let ui;
	export let users;

	ui.active = "outcoming";
</script>

<Router>
	{#if Object.keys(users).length}
		{#each Object.keys(users) as u}
			<li class="friends-user-box">
				<a class="friends-user" href="{api.paths["@*"]["/"].replace(":1", users[u].username || users[u].id)}" use:link>
					{#if users[u].avatar}
						<img class="friends-user-avatar"
							src="{api.paths["@*"].i["0"]["*." + users[u].avatar.split('.')[1]]
								.replace(":1", users[u].id)
								.replace(":2", users[u].avatar.split('.')[0])
								+ "?thumb=100"}"
							alt=""/>
					{:else}
						<p class="friends-user-avatar">{users[u].name[0] || dict.profile.user.default.name[0]}</p>
					{/if}
					<p class="friends-user-name">{users[u].name || dict.profile.user.default.name}</p>
					<p class="friends-user-username">@{users[u].username || users[u].id}</p>
					<button class="friends-user-button friends-user-button-negative" on:click|preventDefault|stopPropagation>
						{dict.friends[ui.active].buttons.negative}
					</button>
				</a>
			</li>
		{/each}
	{:else}
		<li id="friends-empty">{dict.friends[ui.active].empty}</li>
	{/if}
</Router>
