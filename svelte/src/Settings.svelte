<script type="text/javascript">
	import { Router, Route, link } from "svelte-routing";

	import { api, dict } from "./store";

	import Error   from "./Error.svelte";
	import Index   from "./settings/Index.svelte";
	import Profile from "./settings/Profile.svelte";
	import Privacy from "./settings/Privacy.svelte";
</script>

<Router>
	<div id="settings">
		<Route path="/">
			<Index/>
		</Route>
		<Route path="/:section" let:params>
			<a href="{$api.paths.settings["/"]}" id="settings-back" use:link>{$dict.settings.back}</a>
			<h1 id="settings-headline">{$dict.settings[params.section].headline}</h1>
			<p id="settings-descr">{$dict.settings[params.section].descr}</p>
			{#if params.section == "profile"}
				<Profile/>
			{:else if params.section == "privacy"}
				<Privacy/>
			{:else}
				<Error code={404}/>
			{/if}
		</Route>
	</div>
</Router>
