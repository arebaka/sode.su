<script type="text/javascript">
	import { Router, Route, link, navigate } from "svelte-routing";

	import { api, dict } from "../store";
	import { showToast } from "../tools";

	export let ui;
	export let list;

	ui.active = "incoming";

	function accept(id)
	{
		fetch($api.methods["friends.add"].path, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body:   JSON.stringify({ target: parseInt(id) })
			})
			.then(res => res.json())
			.then(res => {
				if (res.status == $api.errors.ok) {
					ui.active = ui.active;
					showToast(
						$dict.friends.incoming.toasts.accepted
							.replace("{{name}}", list[id].name || $dict.profile.user.default.name),
						"success", 5000
					);
				}
			});
	}
</script>

<Router>
	{#if Object.keys(list).length}
		{#each Object.keys(list) as u}
			<li class="friends-user-box">
				<a class="friends-user" href="{$api.paths["@*"]["/"].replace(":1", list[u].username || u)}" use:link>
					{#if list[u].avatar}
						<img class="friends-user-avatar"
							src="{$api.paths["@*"].i["0"]["*." + list[u].avatar.split('.')[1]]
								.replace(":1", u)
								.replace(":2", list[u].avatar.split('.')[0])
								+ "?thumb=100"}"
							alt=""/>
					{:else}
						<p class="friends-user-avatar">{list[u].name[0] || $dict.profile.user.default.name[0]}</p>
					{/if}
					<p class="friends-user-name">{list[u].name || $dict.profile.user.default.name}</p>
					<p class="friends-user-username">@{list[u].username || u}</p>
					<button class="friends-user-button friends-user-button-positive" on:click|preventDefault|stopPropagation={() => accept(u)}>
						{$dict.friends[ui.active].buttons.positive}
					</button>
				</a>
			</li>
		{/each}
	{:else}
		<li id="friends-empty">{$dict.friends[ui.active].empty}</li>
	{/if}
</Router>
