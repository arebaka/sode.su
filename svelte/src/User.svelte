<script type="text/javascript">
	import Error from "./Error.svelte";

	const profileButtons = ["chat", "friend", "theme", "images", "videos", "music"];

	export let api;
	export let dict;
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
			.replace("{{name}}", profile.name);
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
	<div id="profile">
		{#if profile.cover}
			<img
				src="{api.paths["@*"].i["@"] + '/' + profile.cover}"
				alt="" id="profile-cover" />
		{/if}

		<h1 id="profile-name">{profile.name ? profile.name : dict.profile.user.default.name}</h1>

		{#if profile.avatar}
			<img src="{api.paths["@*"].i["@"] + '/' + profile.avatar}"
				alt="" class="image" id="profile-avatar" />
		{:else}
			<img src="img/avatar.png" alt="" id="profile-avatar" />
		{/if}

		<div id="profile-buttons">
			{#each profileButtons as button}
				<button class="profile-button" id="profile-{button}">{dict.profile.user.buttons[button]}</button>
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