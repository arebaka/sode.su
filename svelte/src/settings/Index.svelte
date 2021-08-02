<script type="text/javascript">
	import { link } from "svelte-routing";

	export let api;
	export let dict;

	const sections = ["profile", "privacy"];

	document.title = dict.settings.index.title;
</script>

<h1 id="settings-headline">{dict.settings.index.headline}</h1>
<p id="settings-descr">{dict.settings.index.descr}</p>
<ul id="settings-sections">
	{#each sections as section}
		<a href="{api.paths.settings[section]}" class="settings-section" id="setting-section-{section}" use:link>
			{dict.settings[section].headline}
		</a>
	{/each}
</ul>