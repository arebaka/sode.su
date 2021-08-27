<script type="text/javascript">
	import { Router, Route, link, navigate } from "svelte-routing";

	import User     from "./User.svelte";
	import Error    from "./Error.svelte";
	import Settings from "./Settings.svelte";

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
			fetch(api.methods.logout.path, { method: "POST" }).then(() => {
				delCookie("userid");
				document.getElementsByTagName("html")[0].classList.remove("authorized");
				me = null;
			});
		}

	}

	window.onTelegramAuth = function(user) {
		fetch(api.methods.auth.path, {
				method:  "POST",
				headers: { "Content-Type": "application/json" },
				body:    JSON.stringify(user)
			})
			.then(res => res.json())
			.then(res => {
				if (res.status == api.errors.ok) {
					document.getElementsByTagName("html")[0].className += " authorized";
					setCookie("userid", res.userid, 90);
					ui.logIn.open = false;

					fetch(api.methods.me.path, { method: "POST" })
						.then(res => res.json())
						.then(data => {
							if (data.status == api.errors.ok) {
								me = data.data;
								navigate(res.new_user
									? api.paths.settings.profile
									: api.paths["@*"]["/"].replace(":1",
										me.username ? me.username : me.id
									));
							}
						});
				}
			});
	}

	let api;
	let lang;
	let dict;
	let me;
	let params = location.search
		? JSON.parse('{"'
			+ decodeURI(location.search
				.substring(1))
				.replace(/"/g, '\\"')
				.replace(/&/g, '","')
				.replace(/=/g,'":"')
			+ '"}'
		) : [];

	let ui = {
		view: null,
		topnav: {
			tabs:  ["friends", "feed", "feedback", "clubs"],
			media: ["images", "videos", "music"],
			views: ["light_square", "light_circle", "dark_circle", "dark_square"]
		},
		menu: {
			open:  false,
			items: ["friends", "feed", "feedback", "clubs", "images", "videos", "music"]
		},
		me: {
			menu: {
				open:  false,
				items: ["settings", "themes", "bookmarks", "stickers", "polls", "moderation"]
			}
		},
		logIn: {
			open: false
		}
	};

	$: if (lang && api) {
		if (!api.langs[lang]) {
			lang = "eng";
		}

		setCookie("lang", lang, 10000);
		document.getElementsByTagName("html")[0].setAttribute("lang", api.langs[lang].iso2);

		fetch(api.paths.i18n["*.json"].replace(":1", lang))
			.then(res => res.json())
			.then(res => dict = res);
	}

	$: if (ui.view) {
		let classlist = document.getElementsByTagName("html")[0].classList;
		classlist.remove("light", "square", "dark", "circle");

		switch (ui.view) {
			case "light_square":
				classlist.add("light", "square");
			break;
			case "light_circle":
				classlist.add("light", "circle");
			break;
			case "dark_circle":
				classlist.add("dark", "circle");
			break;
			case "dark_square":
				classlist.add("dark", "square");
			break;
		}

		setCookie("view", ui.view, 10000);
	}

	fetch("api")
		.then(res => res.json())
		.then(res => {
			api     = res;
			ui.view = getCookie("view") || "light_square";
			lang    = params["lang"]
				|| getCookie("lang")
				|| (() => {
					let iso2 = navigator.language.substr(0, 2).toLowerCase();

					for (let lang in api.langs) {
						if (api.langs[lang].iso2 == iso2)
							return lang;
					}
				})()
				|| "eng";

			if (getCookie("userid")) {
				fetch(api.methods.me.path, { method: "POST" })
					.then(res => res.json())
					.then(res => {
						if (res.status == api.errors.ok) {
							me = res.data;
							document.getElementsByTagName("html")[0].className += " authorized";
						}
					});
			}
		});
</script>

<Router>
	{#if api && dict}
		<nav id="topnav-box">
			<a href="/" rel="index" id="topnav-logo"></a>
			<div id="menu-button-box">
				<button class="topnav-button" id="menu-button" on:click={() => {ui.menu.open = !ui.menu.open}}></button>
			</div>

			<ul id="topnav">
				{#each ui.topnav.tabs as tab}
					<li class="topnav-box" id="topnav-{tab}">
						<a href="{tab}" rel="bookmark" class="topnav" id="topnav-{tab}" use:link>
							<p class="notice" data-counter="0"></p>
							<p class="topnav-label">{dict.topnav[tab]}</p>
						</a>
					</li>
				{/each}
				<li class="topnav-box" id="topnav-media">
					<p class="topnav-label">{dict.topnav.media}</p>
					<ul id="topnav-medias">
						{#each ui.topnav.media as section}
							<li class="topnav-media-box">
								<a href="{section}" rel="bookmark" class="topnav-media" id="topnav-{section}">
									<p class="notice" data-counter="1">α</p>
									<p class="topnav-media-label">{dict.topnav[section]}</p>
								</a>
							</li>
						{/each}
					</ul>
				</li>
				<li class="topnav-box" id="topnav-view">
					<p class="topnav-label">{dict.topnav.view}</p>
					<ul id="topnav-views">
						{#each ui.topnav.views.filter(i => i != ui.view) as view}
							<li class="topnav-view-box">
								<p class="topnav-view" on:click={() => {ui.view = view}}>{dict.topnav.views[view]}</p>
							</li>
						{/each}
					</ul>
				</li>
				<li class="topnav-box" id="topnav-language">
					<p class="topnav-label">{dict.topnav.lang}</p>
					<ul id="topnav-languages">
						{#each Object.values(api.langs).filter(i => i.code != lang) as l}
							<li class="topnav-language-box">
								<p class="topnav-language" on:click={() => {lang = l.code}}>{l.native}</p>
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
			<div id="me" on:click={() => {ui.me.menu.open = !ui.me.menu.open}}>
				<p id="me-name">{me.name || dict.profile.user.default.name}</p>
				<p id="me-username">{me.username ? "@" + me.username : ""}</p>
				{#if me.avatar}
					<img src="" alt="" id="me-avatar" />
				{:else}
					<p id="me-avatar">{me.name[0] || dict.profile.user.default.name[0]}</p>
				{/if}
			</div>
			<nav id="me-menu-box" class:open={ui.me.menu.open} on:click={() => {ui.me.menu.open = !ui.me.menu.open}}>
				<ul id="me-menu">
					<li class="me-menu-box" id="me-menu-profile">
						<a href="@{me.username ? me.username : me.id}" rel="me" class="me-menu" use:link on:click={document.activeElement.blur}>
							{dict.me_menu.profile}
						</a>
					</li>
					{#each ui.me.menu.items as item}
						<li class="me-menu-box" id="me-menu-{item}">
							<a href="{item}" rel="me" class="me-menu" use:link on:click={document.activeElement.blur}>
								{dict.me_menu[item]}
							</a>
						</li>
					{/each}
					<li class="me-menu-box" id="me-menu-log-out">
						<button class="me-menu" on:click={logout} on:click={document.activeElement.blur}>
							{dict.me_menu.log_out}
						</button>
					</li>
					<li class="me-menu-box" id="me-menu-view" on:click|stopPropagation>
						<select class="me-menu" bind:value={ui.view} on:change={document.activeElement.blur}>
							{#each Object.values(ui.topnav.views) as v}
								<option class="me-menu-view" value="{v}" selected={ui.view == v}>{dict.topnav.views[v]}</option>
							{/each}
						</select>
					</li>
					<li class="me-menu-box" id="me-menu-language" on:click|stopPropagation>
						<select class="me-menu" bind:value={lang} on:change={document.activeElement.blur}>
							{#each Object.values(api.langs) as l}
								<option class="me-menu-language" value="{l.code}" selected={lang == l.code}>{l.native}</option>
							{/each}
						</select>
					</li>
				</ul>
			</nav>
		{/if}

		<nav id="menu-box" class:open={ui.menu.open} on:click={() => {ui.menu.open = !ui.menu.open}}>
			<a href="/" rel="index" id="menu-logo"></a>
			<ul id="menu" on:click|stopPropagation>
				{#each ui.menu.items as item}
					<li class="menu-box" id="menu-{item}">
						<a href="{item}" rel="bookmark" class="menu" use:link>
							<p class="notice" data-counter="0"></p>
							<p class="menu-label">{dict.menu[item]}</p>
						</a>
					</li>
				{/each}
				<li class="menu-box" id="menu-language">
					<select class="menu" bind:value={lang}>
						{#each Object.values(api.langs) as l}
							<option class="menu-language" value="{l}" selected={lang == l.code}>{l.native}</option>
						{/each}
					</select>
				</li>
			</ul>
		</nav>

		<div id="log-in-box" class:open={ui.logIn.open} on:click={() => {ui.logIn.open = false}}>
			<div id="log-in" on:click|stopPropagation>
				<h1 id="log-in-headline">{dict.log_in.headline}</h1>
				<script async src="https://telegram.org/js/telegram-widget.js?15"
					data-telegram-login="sodesu_bot" data-size="large" data-radius="0"
					data-onauth="onTelegramAuth(user)" data-request-access="write"></script>
			</div>
		</div>

		<div id="log-out-box">
			<div id="log-out">
				<h1 id="log-out-headline"></h1>
				<p id="log-out-text"></p>
				<button id="log-out-yes-button"></button>
				<button id="log-out-no-button"></button>
			</div>
		</div>

		<div id="toasts"></div>

		<main id="container">
			<Route path="/settings/*">
				<Settings api={api} dict={dict} bind:me={me}/>
			</Route>
			<Route path="/:entity" let:params>
				{#if /^@([0-9]+)|([A-Za-z_][A-Za-z0-9_\-\.]*)$/.test(params.entity)}
					<User api={api} dict={dict} me={me} descriptor={params.entity.substring(1)}/>
				{:else}
					<Error code={404}/>
				{/if}
			</Route>
			<Route path="*">
				<Error code={404}/>
			</Route>
		</main>

		<footer id="footer">
			<p id="copyright"><small> sode.su &copy; 2019-2021 </small></p>
		</footer>
	{:else}
		<p class="preloader">Loading...</p>
	{/if}
</Router>
