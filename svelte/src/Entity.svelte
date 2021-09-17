<script>
	import Error from "./Error.svelte";
	import User  from "./User.svelte";

	export let descriptor;

	let type = null;

	if (/^@(([0-9]+)|([A-Za-z_][A-Za-z0-9_\-\.]*))$/.test(descriptor)) {
		type = "user";
	}
</script>

{#if type == "user"}
	<User descriptor={descriptor.substring(1)}/>
{:else}
	<Error code={404}/>
{/if}