<script lang="ts">
	type Props = {
		user: { id: string; email: string } | null;
		hasLicense: boolean;
	};

	let { user, hasLicense }: Props = $props();

	let mobileOpen = $state(false);

	function toggleMobile() {
		mobileOpen = !mobileOpen;
	}

	function closeMobile() {
		mobileOpen = false;
	}
</script>

<nav>
	<div class="container nav-inner">
		<a href="/" class="logo" onclick={closeMobile}>MyPhoto<span>3D</span></a>

		<!-- Desktop links -->
		<ul class="nav-links desktop">
			<li><a href="/catalog">Catalog</a></li>
			<li><a href="/#how-it-works">How it works</a></li>
			<li><a href="/#for-sellers">For sellers</a></li>
			{#if user}
				<li><a href="/account">My Account</a></li>
			{:else}
				<li><a href="/auth/login">Sign in</a></li>
			{/if}
			{#if !hasLicense}
				<li><a href="/buy" class="nav-cta">Get access</a></li>
			{/if}
		</ul>

		<!-- Mobile hamburger button -->
		<button
			class="hamburger"
			onclick={toggleMobile}
			aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
			aria-expanded={mobileOpen}
		>
			<span class="bar" class:open={mobileOpen}></span>
			<span class="bar" class:open={mobileOpen}></span>
			<span class="bar" class:open={mobileOpen}></span>
		</button>
	</div>

	<!-- Mobile menu -->
	{#if mobileOpen}
		<div class="mobile-menu">
			<ul class="nav-links mobile">
				<li><a href="/catalog" onclick={closeMobile}>Catalog</a></li>
				<li><a href="/#how-it-works" onclick={closeMobile}>How it works</a></li>
				<li><a href="/#for-sellers" onclick={closeMobile}>For sellers</a></li>
				{#if user}
					<li><a href="/account">My Account</a></li>
				{:else}
					<li><a href="/auth/login">Sign in</a></li>
				{/if}
				{#if !hasLicense}
					<li><a href="/buy" onclick={closeMobile} class="nav-cta-mobile">Get access</a></li>
				{/if}
			</ul>
		</div>
	{/if}
</nav>

<style>
	nav {
		border-bottom: 1px solid var(--rule);
		background: var(--cream);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 2.5rem;
	}

	.nav-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 4rem;
	}

	.logo {
		font-family: var(--serif);
		font-size: 1.2rem;
		letter-spacing: -0.01em;
		color: var(--ink);
		text-decoration: none;
		flex-shrink: 0;
	}

	.logo span {
		color: var(--accent);
	}

	/* ── Desktop nav ── */
	.nav-links {
		display: flex;
		align-items: center;
		gap: 2rem;
		list-style: none;
	}

	.nav-links.desktop {
		display: flex;
	}

	.nav-links a {
		font-size: 0.875rem;
		color: var(--ink-mid);
		text-decoration: none;
		transition: color 0.15s;
		white-space: nowrap;
	}

	.nav-links a:hover {
		color: var(--ink);
	}

	.nav-cta {
		background: var(--ink) !important;
		color: var(--cream) !important;
		padding: 0.5rem 1.25rem;
		border-radius: 2px;
		font-size: 0.8125rem !important;
		letter-spacing: 0.03em !important;
		transition: background 0.15s;
	}

	.nav-cta:hover {
		background: #3a3530 !important;
	}

	/* ── Hamburger ── */
	.hamburger {
		display: none;
		flex-direction: column;
		justify-content: center;
		gap: 5px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		margin-right: -0.5rem;
	}

	.bar {
		display: block;
		width: 22px;
		height: 1.5px;
		background: var(--ink);
		transition: transform 0.2s ease, opacity 0.2s ease;
		transform-origin: center;
	}

	.bar:nth-child(1).open {
		transform: translateY(6.5px) rotate(45deg);
	}

	.bar:nth-child(2).open {
		opacity: 0;
	}

	.bar:nth-child(3).open {
		transform: translateY(-6.5px) rotate(-45deg);
	}

	/* ── Mobile menu ── */
	.mobile-menu {
		border-top: 1px solid var(--rule);
		background: var(--cream);
		padding: 1rem 0 1.5rem;
	}

	.nav-links.mobile {
		flex-direction: column;
		align-items: flex-start;
		gap: 0;
		padding: 0 2.5rem;
	}

	.nav-links.mobile li {
		width: 100%;
		border-bottom: 1px solid var(--rule);
	}

	.nav-links.mobile li:first-child {
		border-top: 1px solid var(--rule);
	}

	.nav-links.mobile a {
		display: block;
		padding: 0.875rem 0;
		font-size: 1rem;
		color: var(--ink);
	}

	.nav-cta-mobile {
		color: var(--accent) !important;
		font-weight: 500;
	}

	/* ── Responsive ── */
	@media (max-width: 860px) {
		.nav-links.desktop {
			display: none;
		}

		.hamburger {
			display: flex;
		}
	}
</style>