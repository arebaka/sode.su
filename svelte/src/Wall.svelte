<script type="text/javascript">
	import { link } from "svelte-routing";

	export let api;
	export let dict;
	export let me;
	export let actions;
	export let my;
	export let profile;
	export let relation;

	let wall    = null;
	let posts   = null;
	let newPost = {
		text:     "",
		response: null
	};

	function post()
	{
		newPost.response = null;

		if (newPost.text.length > api.types.Post_Text.max_length)
			return newPost.response = api.errors.too_long

		fetch(api.methods["wall.post"].path, {
				method:  "POST",
				headers: { "Content-Type": "application/json" },
				body:    JSON.stringify({
					wall:               `user/${profile.id}/${wall.index}`,
					author:             newPost.author,
					text:               newPost.text,
					schedule:           null,
					commentable:        "public",
					anon_comments_only: false,
					poll:               null,
					repost:             null
				})
			})
			.then(res => res.json())
			.then(res => {
				newPost.response = res.status;
				if (newPost.response == api.errors.ok) {
					document.getElementById("wall-post").reset();
					wall = wall;
				}
			});
	}

	function checkPost(text)
	{
		newPost.text     = text;
		newPost.response = null;

		if (text.length > api.types.Post_Text.max_length)
			return newPost.response = api.errors.too_long
	}

	$: if (wall) {
		let url = new URL(location.href);
		url.searchParams.set("wall", wall.index);
		history.pushState(null, "", url.href);

		fetch(api.methods["wall.posts"].path, {
				method:  "POST",
				headers: { "Content-Type": "application/json" },
				body:    JSON.stringify({
					wall:    `user/${profile.id}/${wall.index}`,
					sorting: wall.sorting
				})
			})
			.then(res => res.json())
			.then(res => {
				if (res.status == api.errors.ok) {
					let data = res.data;

					fetch(api.methods.entities.path, {
							method:  "POST",
							headers: { "Content-Type": "application/json" },
							body:    JSON.stringify({ entities: data.map(p => p.author) })
						})
						.then(res => res.json())
						.then(res => {
							if (res.status == api.errors.ok) {
								for (let i = 0; i < data.length; i++) {
									data[i].author = res.data[data[i].author];
								}
							}

							posts = data;
						});
				}
			});
	}
	else {
		let url = new URL(location.href);
		url.searchParams.delete("wall");
		history.pushState(null, "", url.href);

		posts            = null;
		newPost.response = null;
	}

	$: if (profile) {
		wall = null;

		let url   = new URL(location.href);
		let index = url.searchParams.get("wall");

		if (index) {
			wall = profile.walls.find(w => w.index === index) || null;
		}
	}
</script>

<div id="wall" data-relation="{relation ? relation.relation : "none"}">
	{#if !wall}
		<h1 id="walls-headline">{dict.wall.list.headline}</h1>
		<p id="walls-descr">{dict.wall.list.descr}</p>
		<ul id="walls">
			{#each profile.walls as w}
				<li class="walls-wall-box">
					<div class="walls-wall" on:click={() => {wall = w}}>
						<h2 class="walls-wall-name">{w.name || dict.wall.user.default.name} <span class="walls-wall-index">#{w.index}</span></h2>
						<p class="walls-wall-posts-count">{w.n_posts}</p>
						<p class="walls-wall-prop">{dict.wall.user.visibility[w.visibility]}</p>
						<p class="walls-wall-prop">{dict.wall.user.postable[w.postable]}</p>
						<p class="walls-wall-prop">{dict.wall.user.commentable[w.commentable]}</p>
						{#if w.anon_posts_only}
							<p class="walls-wall-prop">{dict.wall.user.anon_posts_only}</p>
						{/if}
						{#if w.anon_comments_only}
							<p class="walls-wall-prop">{dict.wall.user.anon_comments_only}</p>
						{/if}
						<p class="walls-wall-prop">{dict.wall.user.sorting[w.sorting]}</p>
						{#if w.sorting == "bumps" || w.sorting == "bumps_reverse"}
							<p class="walls-wall-prop">{dict.wall.user.bumplimit.replace("{{number}}", w.bumplimit)}</p>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
		{#if relation && relation.relation == "me"}
			<button id="walls-create" on:click={() => {}}>{dict.wall.list.create}</button>
		{/if}
	{:else}
		<button id="wall-back" on:click={() => {wall = null}}>{dict.wall.back}</button>
		<h1 id="wall-headline">{wall.name || dict.wall.user.default.name} <span id="wall-index">#{wall.index}</span></h1>
		{#if me && relation && (relation.relation == "me" || wall.postable == "public"
				|| (wall.postable == "protected" && relation.relation == "friend"))}
			<form enctype="text/plain" action={api.methods["wall.post"].path} method="POST"
					id="wall-post" class:error={newPost.response} on:submit|preventDefault={post}>
				<textarea name="text" placeholder="{dict.wall.post.placeholder}" id="wall-post-text" required
					on:click={e => actions.updateAreaHeight(e.target)} on:input={e => actions.updateAreaHeight(e.target)}
					on:input={e => checkPost(e.target.value)}>{newPost.text}</textarea>
				{#if my}
					<select name="author" id="wall-post-author" required bind:value={newPost.author}>
						{#if wall.anon_posts_only}
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
					{#if newPost.author && my[newPost.author].avatar}
						<img src="{api.paths["@*"].i['0']["*." + my[newPost.author].avatar.split('.')[1]]
								.replace(":1", my[newPost.author].id)
								.replace(":2", my[newPost.author].avatar.split('.')[0])}?thumb=100"
							alt="" id="wall-post-author-avatar" />
					{/if}
				{/if}
				<input type="reset" value="{dict.wall.post.reset}" id="wall-post-reset" />
				<input type="submit" value="{dict.wall.post.submit}" id="wall-post-submit" />
				{#if newPost && newPost.response !== null}
					<p id="wall-post-response">
						{dict.wall.post.responses[
							Object.keys(api.errors).find(key => api.errors[key] == newPost.response)
						]}
					</p>
				{/if}
			</form>
		{/if}
		{#if posts && posts.length}
			<div id="wall-posts">
				{#each posts as post}
					<article class="wall-post" id="post{post.index}">
						<header class="wall-post-header">
							<a href="{api.paths["@*"]["/"].replace(":1", post.author.username || post.author.id)}"
									class="wall-post-author" use:link>
								{#if post.author.avatar}
									<img src="{api.paths["@*"].i["0"]["*." + post.author.avatar.split('.')[1]]
											.replace(":1", post.author.id)
											.replace(":2", post.author.avatar.split('.')[0])}?thumb=100"
										alt="" class="wall-post-author-avatar" />
								{:else}
									<p class="wall-post-author-avatar">{post.author.name[0] || dict.profile.user.default.name[0]}</p>
								{/if}
								<p class="wall-post-author-name">{post.author.name || dict.profile.user.default.name}</p>
							</a>
							<p class="wall-post-datetime">{actions.formatDT(post.sent_dt)}</p>
						</header>
						<div class="wall-post-text">{post.text}</div>
					</article>
				{/each}
			</div>
		{:else}
			<p id="wall-empty">{dict.wall.empty}</p>
		{/if}
	{/if}
</div>
