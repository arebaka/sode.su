<script type="text/javascript">
	import { navigate } from "svelte-routing";

	export let api;
	export let dict;
	export let me;
	export let actions;
	export let my;
	export let profile;
	export let relation;

	let ui = null;

	function post()
	{
		ui.post.response = null;

		if (ui.post.text.length > api.types.Post_Text.max_length)
			return ui.post.response = api.errors.too_long

		fetch(api.methods["wall.post"].path, {
				method:  "POST",
				headers: { "Content-Type": "application/json" },
				body:    JSON.stringify({
					wall:              `user/${profile.id}/${ui.index}`,
					author:             ui.post.author,
					text:               ui.post.text,
					schedule:           null,
					commentable:        "public",
					anon_comments_only: false,
					poll:               null,
					repost:             null
				})
			})
			.then(res => res.json())
			.then(res => {
				ui.post.response = res.status;
				if (ui.post.response == api.errors.ok) {
					alert(res);
				}
			});
	}

	function checkPost(text)
	{
		ui.post.text     = text;
		ui.post.response = null;

		if (text.length > api.types.Post_Text.max_length)
			return ui.post.response = api.errors.too_long
	}

	function updateAreaHeight(area)
	{
		area.style.height = "0px";
		area.style.height = area.scrollHeight + 2 + "px";
	}

	$: if (ui) {
		let url = new URL(location.href);
		url.searchParams.set("wall", ui.index);
		navigate(url.href);
	}
	else {
		let url = new URL(location.href);
		url.searchParams.delete("wall");
		navigate(url.href);
	}

	(() => {
		let url   = new URL(location.href);
		let index = url.searchParams.get("wall");

		if (index) {
			let wall = profile.walls.find(w => w.index === index);

			if (wall) {
				ui = { ...wall, post: {} };
			}
		}
	})();
</script>

<div id="wall" data-relation="{relation ? relation.relation : "none"}">
	{#if !ui}
		<h1 id="walls-headline">{dict.wall.list.headline}</h1>
		<p id="walls-descr">{dict.wall.list.descr}</p>
		<ui id="walls">
			{#each profile.walls as wall}
				<li class="walls-wall-box">
					<div class="walls-wall" on:click={() => {ui = { ...wall, post: {} }}}>
						<h2 class="walls-wall-name">{wall.name || dict.wall.user.default.name} <span class="walls-wall-index">#{wall.index}</span></h2>
						<p class="walls-wall-posts-count">{wall.n_posts}</p>
						<p class="walls-wall-prop">{dict.wall.user.visibility[wall.visibility]}</p>
						<p class="walls-wall-prop">{dict.wall.user.postable[wall.postable]}</p>
						<p class="walls-wall-prop">{dict.wall.user.commentable[wall.commentable]}</p>
						{#if wall.anon_posts_only}
							<p class="walls-wall-prop">{dict.wall.user.anon_posts_only}</p>
						{/if}
						{#if wall.anon_comments_only}
							<p class="walls-wall-prop">{dict.wall.user.anon_comments_only}</p>
						{/if}
						<p class="walls-wall-prop">{dict.wall.user.sorting[wall.sorting]}</p>
						{#if wall.sorting == "bumps" || wall.sorting == "bumps_reverse"}
							<p class="walls-wall-prop">{dict.wall.user.bumplimit.replace("{{number}}", wall.bumplimit)}</p>
						{/if}
					</div>
				</li>
			{/each}
		</ui>
		{#if relation && relation.relation == "me"}
			<button id="walls-create" on:click={() => {}}>{dict.wall.list.create}</button>
		{/if}
	{:else}
		<button id="wall-back" on:click={() => {ui = null}}>{dict.wall.back}</button>
		<h1 id="wall-headline">{ui.name || dict.wall.user.default.name} <span id="wall-index">#{ui.index}</span></h1>
		{#if me && relation && (relation.relation == "me" || ui.postable == "public"
				|| (ui.postable == "protected" && relation.relation == "friend"))}
			<form enctype="text/plain" action={api.methods["wall.post"].path} method="POST"
					id="wall-post" class:error={ui.post.response} on:submit|preventDefault={post}>
				<textarea name="text" placeholder="{dict.wall.post.placeholder}" id="wall-post-text" required
					on:click={e => updateAreaHeight(e.target)} on:input={e => updateAreaHeight(e.target)}
					on:input={e => checkPost(e.target.value)}></textarea>
				{#if my}
					<select name="author" id="wall-post-author" required bind:value={ui.post.author}>
						{#if ui.anon_posts_only}
							<option value="user/0" class="wall-post-author-option" selected>
								{my["user/0"].name || dict.profile.user.default.name}
							</option>
						{:else}
							{#each Object.keys(my) as entity}
								<option value={entity} class="wall-post-author-option" selected={entity == "user/" + me.id}>
									{my[entity].name || dict.profile[my[entity].type].default.name}
								</option>
							{/each}
						{/if}
					</select>
					{#if ui.post.author && my[ui.post.author].avatar}
						<img src="{api.paths["@*"].i['0']["*." + my[ui.post.author].avatar.split('.')[1]]
							.replace(":1", my[ui.post.author].id)
							.replace(":2", my[ui.post.author].avatar.split('.')[0])
							+ "?thumb=100"}" alt="" id="wall-post-author-avatar" />
					{/if}
				{/if}
				<input type="reset" value="{dict.wall.post.reset}" id="wall-post-reset" />
				<input type="submit" value="{dict.wall.post.submit}" id="wall-post-submit" />
				{#if ui.post && ui.post.response}
					<p id="wall-post-response">
						{dict.wall.post.responses[
							Object.keys(api.errors).find(key => api.errors[key] == ui.post.response)
						]}
					</p>
				{/if}
			</form>
		{/if}
		{#if ui.posts && ui.posts.length}
			
		{:else}
			<p id="wall-empty">{dict.wall.empty}</p>
		{/if}
	{/if}
</div>