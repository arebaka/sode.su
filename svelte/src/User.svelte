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
					body:   JSON.stringify({ target: profile.id })
				})
				.then(res => res.json())
				.then(res => console.log);
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
		}
	};

	export let api;
	export let dict;
	export let me;
	export let descriptor;

	let profile;
	let bio;

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

	function escapeText(text)
	{
		return text
			.replace(/\&/g, "&lt;")
			.replace(/\</g, "&lt;")
			.replace(/\>/g, "&gt;")
			.replace(/\n/g, "<br />");
	}

	document.getElementById("stylesheet").setAttribute("href", "css/user.css");  // TODO change
</script>

{#if profile}
	<div id="profile" class:me={me.id == profile.id}>
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

		<div id="profile-buttons">
			{#each Object.keys(profileButtons) as button}
				<button class="profile-button" id="profile-{button}" on:click={profileButtons[button].handler}>
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