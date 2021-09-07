<script type="text/javascript">
	import { Router, Route, link, navigate } from "svelte-routing";

	import User     from "./User.svelte";
	import Error    from "./Error.svelte";
	import Settings from "./Settings.svelte";
	import Friends  from "./Friends.svelte";

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

	function allowCookies()
	{
		setCookie("cookies_perm", true, 10000);
		ui.askForCookies.open = false;
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

	const actions = {
		showToast: (text, type="alert", duration=5000) => {
			const toast = {
				text:     text,
				type:     type,
				duration: duration
			};

			toasts.push(toast);
			toasts = toasts;

			if (duration) {
				setTimeout(() => {
					actions.hideToast(toast);
				}, duration);
			}
		},
		hideToast: (toast) => {
			toasts.splice(toasts.indexOf(toast), 1);
			toasts = toasts;
		},
		confirm: (dict, onYes, onNo) => {
			ui.confirmation.dict  = dict;
			ui.confirmation.onYes = onYes;
			ui.confirmation.onNo  = onNo;
			ui.confirmation.open  = true;
		},
		updateAreaHeight: (area) => {
			area.style.height = "0px";
			area.style.height = area.scrollHeight + 2 + "px";
		},
		formatDT: (str) => {
			let datetime = new Date(str + "Z");
			let now      = new Date();
			let diff     = now - datetime;

			if (diff < 60000)
				return dict.time.just_now;
			if (diff < 3600000)
				return dict.time.minutes_ago.replace("{{count}}", diff / 60000 >> 0);
			if (datetime.getDate() == now.getDate())
				return dict.time.today
					.replace("{{hours}}",   ("" + datetime.getHours()).padStart(2, '0'))
					.replace("{{minutes}}", ("" + datetime.getMinutes()).padStart(2, '0'))
					.replace("{{seconds}}", ("" + datetime.getSeconds()).padStart(2, '0'));
			if (datetime.getDate() + 1 == now.getDate())
				return dict.time.yesterday
					.replace("{{hours}}",   ("" + datetime.getHours()).padStart(2, '0'))
					.replace("{{minutes}}", ("" + datetime.getMinutes()).padStart(2, '0'))
					.replace("{{seconds}}", ("" + datetime.getSeconds()).padStart(2, '0'));
			return dict.time.default
				.replace("{{hours}}",   ("" + datetime.getHours()).padStart(2, '0'))
				.replace("{{minutes}}", ("" + datetime.getMinutes()).padStart(2, '0'))
				.replace("{{seconds}}", ("" + datetime.getSeconds()).padStart(2, '0'));
		}
	};

	let api;
	let lang;
	let dict;
	let me;
	let my     = {};
	let toasts = [];
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
			open: false,
			disclaimer: {
				approved: false,
				age:      false,
				terms:    false,
				privacy:  false
			}
		},
		logOut: {
			open: false
		},
		confirmation: {
			open: false,
			dict: {
				headline: null,
				text:     null,
				yes:      null,
				no:       null
			},
			onYes: null,
			onNo:  null
		},
		askForCookies: {
			open: false
		},
		notices: {
			friends:  0,
			feed:     0,
			feedback: 0,
			clubs:    0,
			images:   0,
			videos:   0,
			music:    0
		}
	};

	$: if (lang && api) {
		if (!api.langs[lang]) {
			lang = "eng";
		}

		setCookie("lang", lang, 10000);
		document.getElementsByTagName("html")[0].setAttribute("lang", api.langs[lang].iso2);

		fetch(api.paths.i18n["*"].replace(":1", lang))
			.then(res => res.json())
			.then(res => dict = res);

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
	}

	$: if (dict) {
		if (!getCookie("cookies_perm")) {
			ui.askForCookies.open = true;
		}
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

	$: if (me) {
		fetch(api.methods.entities.path, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ entities: ["user/0", "user/" + me.id] })
		})
		.then(res => res.json())
		.then(res => my = res.data);

		fetch(api.methods["friends.get"].path, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ type: "incoming" })
		})
		.then(res => res.json())
		.then(res => {
			if (res.status == api.errors.ok) {
				ui.notices.friends = res.data.length;
			}
		});
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
					<li class="topnav-box" id="topnav-{tab}-box">
						<a href="{tab}" rel="bookmark" class="topnav" id="topnav-{tab}" use:link>
							<p class="notice" data-counter="{ui.notices[tab]}">{ui.notices[tab]}</p>
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
									<p class="notice" data-counter="{ui.notices[section]}">{ui.notices[section]}</p>
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
								<p class="topnav-view" on:click={() => {ui.view = view}}>{dict.views[view]}</p>
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
					<img src="{api.paths["@*"].i["0"]["*." + me.avatar.split('.')[1]]
							.replace(":1", me.id)
							.replace(":2", me.avatar.split('.')[0])
							+ "?thumb=100"}"
						alt="" id="me-avatar" />
				{:else}
					<p id="me-avatar">{me.name[0] || dict.profile.user.default.name[0]}</p>
				{/if}
			</div>
			<nav id="me-menu-box" class:open={ui.me.menu.open} on:click={() => {ui.me.menu.open = false}}>
				<ul id="me-menu">
					<li class="me-menu-box" id="me-menu-profile">
						<a href="@{me.username ? me.username : me.id}" rel="me" class="me-menu" use:link>
							{dict.me_menu.profile}
						</a>
					</li>
					{#each ui.me.menu.items as item}
						<li class="me-menu-box" id="me-menu-{item}">
							<a href="{item}" rel="me" class="me-menu" use:link>
								{dict.me_menu[item]}
							</a>
						</li>
					{/each}
					<li class="me-menu-box" id="me-menu-log-out">
						<button class="me-menu" on:click={() => {ui.logOut.open = true}}>
							{dict.me_menu.log_out}
						</button>
					</li>
					<li class="me-menu-box" id="me-menu-view" on:click|stopPropagation>
						<select class="me-menu" bind:value={ui.view}>
							{#each Object.values(ui.topnav.views) as v}
								<option class="me-menu-view" value="{v}" selected={ui.view == v}>{dict.views[v]}</option>
							{/each}
						</select>
					</li>
					<li class="me-menu-box" id="me-menu-language" on:click|stopPropagation>
						<select class="me-menu" bind:value={lang}>
							{#each Object.values(api.langs) as l}
								<option class="me-menu-language" value="{l.code}" selected={lang == l.code}>{l.native}</option>
							{/each}
						</select>
					</li>
				</ul>
			</nav>
		{/if}

		<nav id="menu-box" class:open={ui.menu.open} on:click={() => {ui.menu.open = false}}>
			<a href="/" rel="index" id="menu-logo"></a>
			<ul id="menu" on:click|stopPropagation>
				{#each ui.menu.items as item}
					<li class="menu-box" id="menu-{item}">
						<a href="{item}" rel="bookmark" class="menu" use:link on:click={() => {ui.menu.open = false}}>
							<p class="notice" data-counter="{ui.notices[item]}">{ui.notices[item]}</p>
							<p class="menu-label">{dict.menu[item]}</p>
						</a>
					</li>
				{/each}
				<li class="menu-box" id="menu-view">
					<select class="menu" bind:value={ui.view}>
						{#each Object.values(ui.topnav.views) as v}
							<option class="menu-view" value="{v}" selected={ui.view == v}>{dict.views[v]}</option>
						{/each}
					</select>
				</li>
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
				{#if !ui.logIn.disclaimer.approved}
					<form id="log-in-disclaimer" on:submit|preventDefault={() => {ui.logIn.disclaimer.approved = true}}>
						<label for="log-in-disclaimer-age" class="log-in-disclaimer-point-box" id="log-in-disclaimer-age-box">
							<input type="checkbox" name="age" class="log-in-disclaimer-point" id="log-in-disclaimer-age" 
								bind:checked={ui.logIn.disclaimer.age} />
							{dict.log_in.disclaimer.age}
						</label>
						<label for="log-in-disclaimer-terms" class="log-in-disclaimer-point-box" id="log-in-disclaimer-terms-box">
							<input type="checkbox" name="terms" class="log-in-disclaimer-point" id="log-in-disclaimer-terms"
								bind:checked={ui.logIn.disclaimer.terms} />
							{@html dict.log_in.disclaimer.terms.label
								.replace("{{link}}",
									`<a href="${dict.log_in.disclaimer.terms.link}">${dict.log_in.disclaimer.terms.name}</a>`
							)}
						</label>
						<label for="log-in-disclaimer-privacy" class="log-in-disclaimer-point-box" id="log-in-disclaimer-privacy-box">
							<input type="checkbox" name="privacy" class="log-in-disclaimer-point" id="log-in-disclaimer-privacy"
								bind:checked={ui.logIn.disclaimer.privacy} />
							{@html dict.log_in.disclaimer.privacy.label
								.replace("{{link}}",
									`<a href="${dict.log_in.disclaimer.privacy.link}">${dict.log_in.disclaimer.privacy.name}</a>`
							)}
						</label>
						{#if ui.logIn.disclaimer.age && ui.logIn.disclaimer.terms && ui.logIn.disclaimer.privacy}
							<input type="submit" value="{dict.log_in.disclaimer.submit}" id="log-in-disclaimer-submit">
						{/if}
					</form>
				{:else}
					<script async src="https://telegram.org/js/telegram-widget.js?15"
						data-telegram-login="sodesu_bot" data-size="large" data-radius="0"
						data-onauth="onTelegramAuth(user)" data-request-access="write"></script>
				{/if}
			</div>
		</div>

		<div id="log-out-box" class:open={ui.logOut.open} on:click={() => {ui.logOut.open = false}}>
			<div id="log-out" on:click|stopPropagation>
				<h1 id="log-out-headline">{dict.log_out.headline}</h1>
				<p id="log-out-text">{dict.log_out.text}</p>
				<button id="log-out-yes-button" on:click={() => { ui.logOut.open = false; logout(); }}>
					{dict.log_out.yes}
				</button>
				<button id="log-out-no-button" on:click={() => {ui.logOut.open = false}}>{dict.log_out.no}</button>
			</div>
		</div>

		<div id="confirmation-box" class:open={ui.confirmation.open} on:click={() => {ui.confirmation.open = false}}>
			<div id="confirmation" on:click|stopPropagation>
				<h1 id="confirmation-headline">{ui.confirmation.dict.headline}</h1>
				<p id="confirmation-text">{ui.confirmation.dict.text}</p>
				<button id="confirmation-yes-button"
						on:click={() => { ui.confirmation.open = false; ui.confirmation.onYes(); }}>
					{ui.confirmation.dict.yes}
				</button>
				<button id="confirmation-no-button"
						on:click={() => { ui.confirmation.open = false; ui.confirmation.onNo(); }}>
					{ui.confirmation.dict.no}
				</button>
			</div>
		</div>

		<div id="ask-for-cookies" class:open={ui.askForCookies.open}>
			<h1 id="ask-for-cookies-headline">{dict.ask_for_cookies.headline}</h1>
			<p id="ask-for-cookies-text">{dict.ask_for_cookies.text}</p>
			<button id="ask-for-cookies-button-ok" on:click={allowCookies}>{dict.ask_for_cookies.ok}</button>
		</div>

		<div id="toasts">
			{#each toasts as toast}
				<div class="toast toast-{toast.type}" on:click={() => actions.hideToast(toast)}>
					{toast.text}
				</div>
			{/each}
		</div>

		<main id="container">
			<Route path="/settings/*">
				<Settings api={api} dict={dict} actions={actions} bind:me={me}/>
			</Route>
			<Route path="/friends/*">
				<Friends api={api} dict={dict} actions={actions} bind:me={me}/>
			</Route>
			<Route path="/:entity" let:params>
				{#if (/^@([0-9]+)|([A-Za-z_][A-Za-z0-9_\-\.]*)$/.test(params.entity))}
					<User api={api} dict={dict} actions={actions} bind:me={me} my={my} descriptor={params.entity.substring(1)}/>
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
