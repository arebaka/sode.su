<script type="text/javascript">
	import Error from "./Error.svelte";

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
		profile: {
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
		},
		wall: null
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
		ui.profile.buttons.friend.allowed = relation.relation == "incoming" || (
			relation.relation == "none" && (
				profile.friendable == "public" || (
					profile.friendable == "protected" && relation.common_friends > 0
		)));

		ui.profile.buttons.unfriend.allowed    = relation.relation == "friend";
		ui.profile.buttons.unsubscribe.allowed = relation.relation == "outcoming";
		ui.profile.buttons.ban.allowed         = !relation.banned;
		ui.profile.buttons.unban.allowed       = relation.banned;
	}
	else {
		ui.profile.buttons.friend.allowed      =
		ui.profile.buttons.unfriend.allowed    =
		ui.profile.buttons.unsubscribe.allowed =
		ui.profile.buttons.ban.allowed         =
		ui.profile.buttons.unban.allowed       = false;
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

	function post()
	{
		ui.wall.post.response = null;

		if (ui.wall.post.text.length > api.types.Post_Text.max_length)
			return ui.wall.post.response = api.errors.too_long

		fetch(api.method["wall.post"].path, {
				method:  "POST",
				headers: { "Content-Type": "application/json" },
				body:    JSON.stringify({
					wall:              `user/${profile.id}/${ui.wall.index}`,
					author:             ui.wall.post.author,
					text:               ui.wall.post.text,
					schedule:           null,
					commentable:        "public",
					anon_comments_only: false,
					poll:               null,
					repost:             null
				})
			})
			.then(res => res.json())
			.then(res => {
				ui.wall.post.response = res.status;
				if (ui.wall.post.response == api.errors.ok) {
					alert(res);
				}
			});
	}

	function checkPost(text)
	{
		ui.wall.post.text     = text;
		ui.wall.post.response = null;

		if (text.length > api.types.Post_Text.max_length)
			return ui.wall.post.response = api.errors.too_long
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
								on:blur={e => updateNote(e.target.value)} on:click={e => updateAreaHeight(e.target)}
								on:input={e => checkNote(e.target.value)} on:input={e => updateAreaHeight(e.target)}
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
			{#each Object.keys(ui.profile.buttons) as button}
				{#if ui.profile.buttons[button].allowed}
					<button class="profile-button" id="profile-button-{button}" on:click={ui.profile.buttons[button].handler}>
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

	<div id="wall" data-relation="{relation ? relation.relation : "none"}">
		{#if !ui.wall}
			<h1 id="walls-headline">{dict.wall.list.headline}</h1>
			<p id="walls-descr">{dict.wall.list.descr}</p>
			<ui id="walls">
				{#each profile.walls as wall}
					<li class="walls-wall-box">
						<div class="walls-wall" on:click={() => {ui.wall = {...wall, post: {}}}}>
							<h2 class="walls-wall-name">{wall.name || dict.wall.user.default.name} #{wall.index}</h2>
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
			<button id="wall-back" on:click={() => {ui.wall = null}}>{dict.wall.back}</button>
			<h1 id="wall-headline">{ui.wall.name || dict.wall.user.default.name} #{ui.wall.index}</h1>
			{#if me && relation && (relation.relation == "me" || ui.wall.postable == "public"
					|| (ui.wall.postable == "protected" && relation.relation == "friend"))}
				<form enctype="text/plain" action={api.methods["wall.post"].path} method="POST"
						id="wall-post" class:error={ui.wall.post.response} on:submit|preventDefault={post}>
					<textarea name="text" placeholder="{dict.wall.post.placeholder}" id="wall-post-text" required
						on:click={e => updateAreaHeight(e.target)} on:input={e => updateAreaHeight(e.target)}
						on:input={e => checkPost(e.target.value)}></textarea>
					{#if my}
						<select name="author" id="wall-post-author" required bind:value={ui.wall.post.author}>
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
						{#if ui.wall.post.author && my[ui.wall.post.author].avatar}
							<img src="{api.paths["@*"].i['0']["*." + my[ui.wall.post.author].avatar.split('.')[1]]
								.replace(":1", my[ui.wall.post.author].id)
								.replace(":2", my[ui.wall.post.author].avatar.split('.')[0])
								+ "?thumb=100"}" alt="" id="wall-post-author-avatar" />
						{/if}
					{/if}
					<input type="reset" value="{dict.wall.post.reset}" id="wall-post-reset" />
					<input type="submit" value="{dict.wall.post.submit}" id="wall-post-submit" />
					{#if ui.wall.post && ui.wall.post.response}
						<p id="wall-post-response">
							{dict.wall.post.responses[
								Object.keys(api.errors).find(key => api.errors[key] == ui.wall.post.response)
							]}
						</p>
					{/if}
				</form>				
			{/if}
			{#if ui.wall.posts && ui.wall.posts.length}
				
			{:else}
				<p id="wall-empty">{dict.wall.empty}</p>
			{/if}
		{/if}
	</div>
{:else if profile === null}
	<Error code={404}/>
{:else}
	<p class="preloader">{dict.preloader}</p>
{/if}
