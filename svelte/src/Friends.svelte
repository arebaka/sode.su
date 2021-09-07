<script type="text/javascript">
	import { Router, Route, link, navigate } from "svelte-routing";

	import Error  from    "./Error.svelte";
	import Mutual from    "./friends/Mutual.svelte";
	import Incoming from  "./friends/Incoming.svelte";
	import Outcoming from "./friends/Outcoming.svelte";

	export let api;
	export let dict;
	export let me;
	export let actions;

	const tabs = ["mutual", "incoming", "outcoming"];

	let ui = {
		active: location.pathname.split('friends/')[1]
	};
	if (!ui.active || tabs.indexOf(ui.active) == -1) {
		ui.active = "mutual";
		navigate(api.paths.friends[ui.active]);
	}

	let list;
	let friends;

	$: if (ui.active) {
		list           = {};
		document.title = dict.friends[ui.active].title;

		fetch(api.methods["friends.get"].path, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ type: ui.active })
		})
		.then(res => res.json())
		.then(res => {
			if (res.status == api.errors.ok) {
				list = res.data;
			}
		});
	};

	$: if (list) {
		if (Object.keys(list).length) {
			let map = {};
			for (let friend of list) {
				map[friend.id] = friend;
			}

			fetch(api.methods.entities.path, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ entities: list.map(u => "user/" + u.id) })
			})
			.then(res => res.json())
			.then(res => {
				for (let id in map) {
					map[id] = { ...map[id], ...res.data["user/" + id] };
				}

				friends = map;
			});
		}
		else {
			friends = {};
		}
	};
</script>

<nav class="subnav-box" id="friends-subnav-box">
	<ul class="subnav" id="friends-subnav">
		{#each tabs as tab}
			<li class="subnav-item-box" id="friends-subnav-{tab}-box">
				<a class="subnav-item" id="friends-subnav-{tab}" rel="bookmark" href="{api.paths.friends[tab]}"
						use:link on:link class:active={ui.active == tab}>
					{dict.friends[tab].label}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<Router>
	<div id="friends" data-active={ui.active}>
		<p id="friends-descr">{dict.friends[ui.active].descr}</p>
		{#if friends}
			<ul id="friends-list">
				<Route path="/:category" let:params>
					{#if params.category == "mutual"}
						<Mutual api={api} dict={dict} actions={actions} bind:me={me} bind:ui={ui} list={friends}/>
					{:else if params.category == "incoming"}
						<Incoming api={api} dict={dict} actions={actions} bind:me={me} bind:ui={ui} list={friends}/>
					{:else if params.category == "outcoming"}
						<Outcoming api={api} dict={dict} actions={actions} bind:me={me} bind:ui={ui} list={friends}/>
					{:else}
						<Error code={404}/>
					{/if}
				</Route>
			</ul>
		{/if}
	</div>
</Router>
