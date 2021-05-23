<script type="text/javascript">
	function setCookie(key, value, days)
	{
		const date = new Date();
		date.setDate(date.getDate() + days);
		document.cookie = `${key}=${value}; path=/; domain=${api.domain}; expires=${date.toUTCString()}; max-age=${days * 24 * 60 * 60}; samesite=lax; secure`;
	}

	function getCookie(name)
	{
		const value = "; " + document.cookie;
		const parts = value.split("; " + name + "=");

		if (parts.length == 2) {
			let part = parts.pop();
			return part ? part.split(";").shift() : undefined;
		}
	}

	function delCookie(key)
	{
		const date = new Date();
		date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));
		document.cookie = key + `=; path=/; domain=${api.domain}; expires=${date.toUTCString()}; max-age=0; samesite=lax; secure`;
	}

	function logout()
	{
		if (getCookie("userid")) {
			fetch(api.methods.logout, { method: "POST" });
		}

		delCookie("userid");
		document.getElementsByTagName("html")[0].classList.remove("authorized");
		me = null;
	}

	window.onTelegramAuth = function(user) {
		fetch(api.methods.auth, {
			method:  "POST",
			headers: { "Content-Type": "application/json" },
			body:    JSON.stringify(user)
		})
		.then(res => res.json())
		.then(res => {
			if (res.status == api.errors.ok) {
				setCookie("userid", res.userid, 90);
				location.href = "@" + res.userid;
			}
		});
	}

	const topnavTabs  = ["friends", "feed", "feedback", "clubs"];
	const mediaTabs   = ["images", "videos", "music"];
	const meMenuItems = ["settings", "themes", "bookmarks", "stickers", "polls", "moderation"];
	const menuItems   = ["friends", "feed", "feedback", "clubs", "images", "videos", "music"];

	let api;
	let lang;
	let dict;
	let params = location.search
		? JSON.parse('{"'
			+ decodeURI(location.search
				.substring(1))
				.replace(/"/g, '\\"')
				.replace(/&/g, '","')
				.replace(/=/g,'":"')
			+ '"}'
		) : [];
	let statusCode = parseInt(document.getElementById("status-code").getAttribute("content"));
	let me;

	let ui = {
		menu: {
			open: false
		},
		logIn: {
			open: false
		}
	};

	$: (lang, (() => {
		if (!api) return;
		if (!api.langs[lang]) {
			lang = "eng";
		}

		dict = undefined;
		setCookie("lang", lang, 10000);
		document.getElementsByTagName("html")[0].setAttribute("lang", api.lang3to2[lang]);

		fetch(api.paths.i18n + api.patterns.i18n.replace("*", lang))
			.then(res => res.json())
			.then(res => dict = res);
	})());

	fetch("api")
		.then(res => res.json())
		.then(res => {
			api  = res;
			lang = params["lang"]
				|| getCookie("lang")
				|| api.lang2to3[navigator.language.substr(0, 2).toLowerCase()]
				|| "eng";

			if (getCookie("userid")) {
				fetch(api.methods.me, { method: "POST" })
					.then(res => res.json())
					.then(res => {
						if (res.status == api.errors.ok) {
							me = res.data;
							document.getElementsByTagName("html")[0].className += " authorized";
						}
					});
			}
		});

	import User  from "./User.svelte";
	import Error from "./Error.svelte";
</script>

{#if api && dict}
	<nav id="topnav-box">
		<a href="{api.host}" rel="index" id="topnav-logo"></a>
		<div id="menu-button-box">
			<button class="topnav-button" id="menu-button" on:click={() => {ui.menu.open = !ui.menu.open}}></button>
		</div>

		<ul id="topnav">
			{#each topnavTabs as tab}
				<li class="topnav-box" id="topnav-{tab}">
					<a href="{tab}" rel="bookmark" class="topnav">
						<p class="notice" data-counter="0"></p>
						<p class="topnav-label">{dict.topnav[tab]}</p>
					</a>
				</li>
			{/each}
			<li class="topnav-box" id="topnav-media">
				<p class="topnav-label">{dict.topnav.media}</p>
				<ul id="topnav-medias">
					{#each mediaTabs as tab}
						<li class="topnav-media-box">
							<a href="{tab}" rel="bookmark" class="topnav-media" id="topnav-{tab}">
								<p class="notice" data-counter="1">α</p>
								<p class="topnav-media-label">{dict.topnav[tab]}</p>
							</a>
						</li>
					{/each}
				</ul>
			</li>
			<li class="topnav-box" id="topnav-language">
				<p class="topnav-label">{dict.topnav.lang}</p>
				<ul id="topnav-languages">
					{#each Object.entries(api.langs) as [code, label]}
						<li class="topnav-language-box">
							<p class="topnav-language" on:click={() => {lang = code}}>{label}</p>
						</li>
					{/each}
				</ul>
			</li>
		</ul>
	</nav>

	<div id="auth">
		<button id="log-in-button" on:click={() => {ui.logIn.open = true}}>{dict.topnav.log_in}</button>
	</div>

	{#if me}
		<div id="me">
			<p id="me-name">{me.name}</p>
			<p id="me-username">{me.alias}</p>
			{#if me.avatar}
				<img src="" alt="" id="me-avatar" />
			{:else}
				<p id="me-avatar">{me.name[0]}</p>
			{/if}
			<nav id="me-menu-box">
				<ul id="me-menu">
					{#each meMenuItems as item}
						<li class="me-menu-box" id="me-menu-{item}">
							<a href="{item}" rel="me" class="me-menu">{dict.me_menu[item]}</a>
						</li>
					{/each}
					<li class="me-menu-box" id="me-menu-log-out">
						<button class="me-menu" on:click={logout}>{dict.me_menu.log_out}</button>
					</li>
					<li class="me-menu-box" id="me-menu-language">
						<select class="me-menu" bind:value={lang}>
							{#each Object.entries(api.langs) as [code, label]}
								<option class="me-menu-language" value="{code}" selected={code == lang}>{label}</option>
							{/each}
						</select>
					</li>
				</ul>
			</nav>
		</div>
	{/if}

	<nav id="menu-box" class:open={ui.menu.open} on:click={() => {ui.menu.open = !ui.menu.open}}>
		<a href="{api.host}" rel="index" id="menu-logo"></a>
		<ul id="menu" on:click|stopPropagation>
			{#each menuItems as item}
				<li class="menu-box" id="menu-{item}">
					<a href="{item}" rel="bookmark" class="menu">
						<p class="notice" data-counter="0"></p>
						<p class="menu-label">{dict.menu[item]}</p>
					</a>
				</li>
			{/each}
			<li class="menu-box" id="menu-language">
				<select class="menu" bind:value={lang}>
					{#each Object.entries(api.langs) as [code, label]}
						<option class="menu-language" value="{code}" selected={code == lang}>{label}</option>
					{/each}
				</select>
			</li>
		</ul>
	</nav>

	<div id="log-in-box" class:open={ui.logIn.open} on:click={() => {ui.logIn.open = false}}>
		<div id="log-in" on:click|stopPropagation>
			<h1 id="log-in-header">{dict.log_in.title}</h1>
			<script async src="https://telegram.org/js/telegram-widget.js?15"
				data-telegram-login="sodesu_bot" data-size="large" data-radius="0"
				data-onauth="onTelegramAuth(user)" data-request-access="write"></script>
		</div>
	</div>

	<div id="log-out-box">
		<div id="log-out">
			<h1 id="log-out-header"></h1>
			<p id="log-out-text"></p>
			<button id="log-out-yes-button"></button>
			<button id="log-out-no-button"></button>
		</div>
	</div>

	<div id="toasts"></div>

	<main id="container">
		{#if statusCode < 200 || statusCode > 299}
			<Error code={parseInt(document.getElementById("status-code").getAttribute("content"))}/>
		{:else if /^\/@[^\/]*$/.test(location.pathname)}
			<User api={api} lang={lang} dict={dict} params={params}/>
		{/if}
	</main>

	<footer id="footer">
		<p id="copyright"><small> Sode.su &copy; 2019-2021 </small></p>
	</footer>
{:else}
	<p id="preloader">Loading...</p>
{/if}