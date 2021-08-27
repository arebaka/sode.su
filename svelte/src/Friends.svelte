<script type="text/javascript">
	import { Router, Route, link, navigate } from "svelte-routing";

	import Error  from    "./Error.svelte";
	import Mutual from    "./friends/Mutual.svelte";
	import Incoming from  "./friends/Incoming.svelte";
	import Outcoming from "./friends/Outcoming.svelte";

	export let api;
	export let dict;
	export let me;

	const tabs = ["mutual", "incoming", "outcoming"];

	let ui = {
		active: location.pathname.split('friends/')[1]
	};
	if (!ui.active) {
		ui.active = "mutual";
		navigate(api.paths.friends[ui.active]);
	}

	let list;
	let users;

	$: if (ui.active) {
		document.title = dict.friends[ui.active].title;
		users = {};

		fetch(api.methods["friends." + ui.active].path, {
			method: "POST"
		})
		.then(res => res.json())
		.then(res => {
			if (res.status == api.errors.ok) {
				list = res.data;
			}
		});
	};

	$: if (list) {
		if (list.length) {
			fetch(api.methods.entities.path, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(list.map(id => "user/" + id))
			})
			.then(res => res.json())
			.then(res => { users = res.data })
		}
		else {
			users = {};
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
		{#if users}
			<ul id="friends-list">
				<Route path="/:category" let:params>
					{#if params.category == "mutual"}
						<Mutual api={api} dict={dict} bind:me={me} bind:ui={ui} users={users}/>
					{:else if params.category == "incoming"}
						<Incoming api={api} dict={dict} bind:me={me} bind:ui={ui} users={users}/>
					{:else if params.category == "outcoming"}
						<Outcoming api={api} dict={dict} bind:me={me} bind:ui={ui} users={users}/>
					{:else}
						<Error code={404}/>
					{/if}
				</Route>
			</ul>
		{/if}
	</div>
</Router>
