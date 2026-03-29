<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Sign In — MyPhoto3D</title>
	<meta name="description" content="Sign in to MyPhoto3D to access your license and generate STL files." />
</svelte:head>

<div class="page">
	<div class="container">
		<div class="layout">

			<!-- Left: brand panel -->
			<div class="brand-panel">
				<a href="/" class="logo">MyPhoto<span>3D</span></a>
				<div class="brand-content">
					<h1>Your photos,<br /><em>printed in light.</em></h1>
					<p>
						Sign in to access your lifetime license and start generating
						3D-printable files from your photos.
					</p>
					<div class="brand-features">
						<div class="brand-feature">
							<span class="check">✓</span>
							<span>Full catalog access, forever</span>
						</div>
						<div class="brand-feature">
							<span class="check">✓</span>
							<span>STL files by email &amp; download</span>
						</div>
						<div class="brand-feature">
							<span class="check">✓</span>
							<span>Sell what you print — no restrictions</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Right: sign in panel -->
			<div class="signin-panel">
				<div class="signin-card">
					<p class="eyebrow">Welcome back</p>
					<h2>Sign in to continue</h2>
					<p class="signin-note">
						Choose a provider to sign in or create your account.
					</p>

					<div class="providers">
						<button
							class="provider-btn"
							onclick={() => signIn('google', { callbackUrl: data.redirectTo })}
						>
							<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
								<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
								<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
								<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
								<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
							</svg>
							Continue with Google
						</button>

						<button
							class="provider-btn"
							onclick={() => signIn('github', { callbackUrl: data.redirectTo })}
						>
							<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
								<path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
							</svg>
							Continue with GitHub
						</button>
					</div>

					<p class="terms-notice">
						By signing in, you agree to our
						<a href="/terms">Terms of Service</a>
						and
						<a href="/privacy">Privacy Policy</a>.
					</p>

					<div class="signin-divider"></div>

					<p class="no-account">
						Don't have a license yet?
						<a href="/buy">Get lifetime access →</a>
					</p>
				</div>
			</div>

		</div>
	</div>
</div>

<style>
	.page {
		min-height: calc(100vh - 4rem);
		display: flex;
		align-items: stretch;
	}

	.container {
		width: 100%;
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 2.5rem;
	}

	.layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		min-height: calc(100vh - 4rem);
		gap: 5rem;
		align-items: center;
	}

	/* ── Brand panel ── */
	.brand-panel {
		display: flex;
		flex-direction: column;
		gap: 3rem;
		padding: 4rem 0;
	}

	.logo {
		font-family: var(--serif);
		font-size: 1.2rem;
		letter-spacing: -0.01em;
		color: var(--ink);
		text-decoration: none;
		align-self: flex-start;
	}

	.logo span {
		color: var(--accent);
	}

	.brand-content h1 {
		font-family: var(--serif);
		font-size: clamp(2rem, 3.5vw, 3rem);
		line-height: 1.08;
		letter-spacing: -0.025em;
		margin-bottom: 1.25rem;
	}

	.brand-content h1 em {
		font-style: italic;
		color: var(--accent);
	}

	.brand-content p {
		font-size: 0.9375rem;
		color: var(--ink-mid);
		line-height: 1.7;
		margin-bottom: 2rem;
		max-width: 38ch;
	}

	.brand-features {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.brand-feature {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		font-size: 0.875rem;
		color: var(--ink-mid);
	}

	.check {
		color: var(--accent);
		flex-shrink: 0;
	}

	/* ── Sign in panel ── */
	.signin-panel {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4rem 0;
		border-left: 1px solid var(--rule);
		padding-left: 5rem;
	}

	.signin-card {
		width: 100%;
		max-width: 380px;
	}

	.eyebrow {
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-light);
		margin-bottom: 0.625rem;
	}

	.signin-card h2 {
		font-family: var(--serif);
		font-size: 1.75rem;
		font-weight: 400;
		letter-spacing: -0.02em;
		margin-bottom: 0.5rem;
	}

	.signin-note {
		font-size: 0.875rem;
		color: var(--ink-mid);
		margin-bottom: 2rem;
	}

	/* ── Provider buttons ── */
	.providers {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.provider-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.875rem 1.5rem;
		background: #fff;
		border: 1px solid var(--rule);
		border-radius: 2px;
		font-size: 0.9375rem;
		font-family: var(--sans);
		color: var(--ink);
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s;
	}

	.provider-btn:hover {
		border-color: var(--ink-mid);
		background: var(--cream);
	}

	/* ── Terms notice ── */
	.terms-notice {
		font-size: 0.75rem;
		color: var(--ink-light);
		line-height: 1.6;
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.terms-notice a {
		color: var(--ink-mid);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.terms-notice a:hover {
		color: var(--ink);
	}

	/* ── Divider ── */
	.signin-divider {
		height: 1px;
		background: var(--rule);
		margin-bottom: 1.5rem;
	}

	/* ── No account ── */
	.no-account {
		font-size: 0.8125rem;
		color: var(--ink-mid);
		text-align: center;
	}

	.no-account a {
		color: var(--ink);
		text-decoration: none;
		transition: color 0.15s;
	}

	.no-account a:hover {
		color: var(--accent);
	}

	/* ── Responsive ── */
	@media (max-width: 860px) {
		.layout {
			grid-template-columns: 1fr;
			gap: 0;
			min-height: auto;
		}

		.brand-panel {
			padding: 3rem 0 2rem;
			gap: 1.5rem;
			border-bottom: 1px solid var(--rule);
		}

		.signin-panel {
			border-left: none;
			padding-left: 0;
			padding: 2.5rem 0 4rem;
			justify-content: flex-start;
		}

		.signin-card {
			max-width: 100%;
		}
	}
</style>