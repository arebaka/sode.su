<script type="text/javascript">
	import { link } from "svelte-routing";

	export let api;
	export let dict;
	export let actions;
	export let my;
	export let profile;
	export let wall;
	export let post;
</script>

<article class="wall-post" id="post{post.index}" class:pinned={post.index === wall.pinned_post_index}>
	<header class="wall-post-header">
		<div class="wall-post-menu-box">
			<button class="wall-post-menu-wrap">{dict.wall.posts.menu.wrap}</button>
			<ul class="wall-post-menu">
				{#if my[`${profile.type}/${profile.id}`] && `${profile.type}/${profile.id}` != "user/0"}
					{#if post.index === wall.pinned_post_index}
						<li class="wall-post-menu-option-box wall-post-menu-unpin-box">
							<button class="wall-post-menu-option wall-post-menu-unpin">{dict.wall.posts.menu.unpin}</button>
						</li>
					{:else}
						<li class="wall-post-menu-option-box wall-post-menu-pin-box">
							<button class="wall-post-menu-option wall-post-menu-pin">{dict.wall.posts.menu.pin}</button>
						</li>
					{/if}
				{/if}
				<li class="wall-post-menu-option-box wall-post-menu-share-box">
					<button class="wall-post-menu-option wall-post-menu-share">{dict.wall.posts.menu.share}</button>
				</li>
				<li class="wall-post-menu-option-box wall-post-menu-book-box">
					<button class="wall-post-menu-option wall-post-menu-book">{dict.wall.posts.menu.book}</button>
				</li>
				{#if my[`${post.author.type}/${post.author.id}`]
						&& `${post.author.type}/${post.author.id}` != "user/0"}
					<li class="wall-post-menu-option-box wall-post-menu-delete-box">
						<button class="wall-post-menu-option wall-post-menu-delete">{dict.wall.posts.menu.delete}</button>
					</li>
				{:else}
					<li class="wall-post-menu-option-box wall-post-menu-report-box">
						<button class="wall-post-menu-option wall-post-menu-report">{dict.wall.posts.menu.report}</button>
					</li>
				{/if}
			</ul>
		</div>
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
	<footer class="wall-post-footer">
		{#if wall.reactionable != "private"}
			<div class="wall-post-reactions-box">
				<button class="wall-post-reactions-wrap">{dict.wall.posts.reactions.wrap}</button>
			</div>
		{/if}
		<button class="wall-post-repost">{dict.wall.posts.repost}</button>
		<p class="wall-post-comments-count">{post.n_comments}</p>
	</footer>
</article>
