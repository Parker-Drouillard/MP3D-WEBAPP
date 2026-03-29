<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_SQUARE_APPLICATION_ID, PUBLIC_SQUARE_ENVIRONMENT } from '$env/static/public';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let card: any = $state(null);
	let payments: any = $state(null);
	let submitting = $state(false);
	let errorMsg = $state('');
	let sdkLoaded = $state(false);

	onMount(async () => {
		if (data.soldOut || data.hasLicense) return;

		const script = document.createElement('script');
		script.src =
			PUBLIC_SQUARE_ENVIRONMENT === 'sandbox'
				? 'https://sandbox.web.squarecdn.com/v1/square.js'
				: 'https://web.squarecdn.com/v1/square.js';

		script.onload = async () => {
			try {
				// @ts-ignore
				payments = window.Square.payments(PUBLIC_SQUARE_APPLICATION_ID, data.locationId);
				card = await payments.card({
					style: {
						'.input-container': {
							borderColor: '#E2DED8',
							borderRadius: '2px'
						},
						'.input-container.is-focus': {
							borderColor: '#1A1714'
						},
						'.input-container.is-error': {
							borderColor: '#C8522A'
						},
						input: {
							fontFamily: '"DM Sans", system-ui, sans-serif',
							fontSize: '15px',
							color: '#1A1714'
						},
						'input::placeholder': {
							color: '#B5B0AA'
						}
					}
				});
				await card.attach('#card-container');
				sdkLoaded = true;
			} catch (e) {
				errorMsg = 'Failed to load payment form. Please refresh and try again.';
			}
		};

		document.head.appendChild(script);
	});

	async function handlePayment() {
		if (!card || submitting) return;

		submitting = true;
		errorMsg = '';

		try {
			const result = await card.tokenize();

			if (result.status !== 'OK') {
				errorMsg = result.errors?.[0]?.message ?? 'Card tokenization failed';
				submitting = false;
				return;
			}

			const res = await fetch('/api/payments/square', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sourceId: result.token })
			});

			const json = await res.json();

			if (!res.ok) {
				errorMsg = json.message ?? 'Payment failed';
				submitting = false;
				return;
			}

			window.location.href = '/catalog';
		} catch (e) {
			errorMsg = 'Payment failed. Please try again.';
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Get Lifetime Access — MyPhoto3D</title>
	<meta name="description" content="Purchase your lifetime license to MyPhoto3D. One-time payment, no subscription." />
</svelte:head>

<div class="page">
	<div class="left">
		<a href="/" class="back">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M13 8H3M7 4l-4 4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
			Back
		</a>

		<div class="left-content">
			<p class="eyebrow">Lifetime license</p>
			<h1>Get permanent<br /><em>access to MyPhoto3D.</em></h1>
			<p class="tagline">
				Upload your photos, choose a product, and receive a print-ready file that reveals your
				image in light. One payment. No subscription. Yours forever.
			</p>

			<div class="features">
				<div class="feature">
					<span class="check">✓</span>
					<span>Full catalog access, forever</span>
				</div>
				<div class="feature">
					<span class="check">✓</span>
					<span>STL files by email or instant download</span>
				</div>
				<div class="feature">
					<span class="check">✓</span>
					<span>Sell what you print — no restrictions</span>
				</div>
				<div class="feature">
					<span class="check">✓</span>
					<span>HEIC, JPEG, and PNG photo uploads</span>
				</div>
				<div class="feature">
					<span class="check">✓</span>
					<span>Sign in with Google or GitHub</span>
				</div>
				<div class="feature">
					<span class="check-n">—</span>
					<span>No recurring subscription</span>
				</div>
			</div>

			<div class="tranche-info">
				<div class="tranche-header">
					<span class="tranche-name">{data.trancheName} pricing</span>
					{#if !data.soldOut}
						<span class="tranche-remaining">{data.remaining} of {data.capacity} remaining</span>
					{/if}
				</div>
				{#if !data.soldOut}
					<div class="slots-track">
						<div class="slots-fill" style="width: {data.percentSold}%"></div>
					</div>
					<p class="tranche-note">
						Price increases when this tranche sells out.
					</p>
				{/if}
			</div>
		</div>
	</div>

	<div class="right">
		<div class="card">
			{#if data.hasLicense}
				<div class="state-block">
					<div class="state-icon">✓</div>
					<h2>You already have access</h2>
					<p>Your lifetime license is active. Head to the catalog to start creating.</p>
					<a href="/catalog" class="btn-primary">
						Go to catalog
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</a>
				</div>

			{:else if data.soldOut}
				<div class="state-block">
					<div class="state-icon sold-out">✕</div>
					<h2>Sold out</h2>
					<p>All licenses have been claimed. Join the waitlist and we'll let you know if more become available.</p>
					<a href="mailto:hello@myphoto3d.ca?subject=Waitlist" class="btn-outline">
						Join the waitlist
					</a>
				</div>

			{:else}
				<div class="price-block">
					<div class="price-amount"><sup>$</sup>{data.priceCAD}</div>
					<p class="price-note">CAD &nbsp;·&nbsp; One-time &nbsp;·&nbsp; Lifetime license</p>
				</div>

				{#if !data.isLoggedIn}
					<div class="login-prompt">
						<p>You need to be signed in to purchase.</p>
						<a href="/auth/login?redirectTo=/buy" class="btn-primary" style="width: 100%; justify-content: center;">
							Sign in to continue
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						</a>
					</div>
				{:else}
					<div id="card-container"></div>

					{#if !sdkLoaded && !errorMsg}
						<p class="loading">Loading payment form...</p>
					{/if}

					{#if errorMsg}
						<div class="error-block">
							<p>{errorMsg}</p>
						</div>
					{/if}

					{#if sdkLoaded}
						<button class="btn-pay" onclick={handlePayment} disabled={submitting}>
							{#if submitting}
								<span class="spinner"></span>
								Processing...
							{:else}
								Pay ${data.priceCAD} CAD
							{/if}
						</button>
					{/if}

					<p class="secure-note">
						<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<rect x="3" y="7" width="10" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>
							<path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
						</svg>
						Secured by Square. We never store your card details.
					</p>
				{/if}
			{/if}
		</div>
	</div>
</div>

<style>
	.page {
		display: grid;
		grid-template-columns: 1fr 1fr;
		min-height: calc(100vh - 4rem);
	}

	/* ── Left panel ── */
	.left {
		padding: 3rem 4rem 3rem 2.5rem;
		border-right: 1px solid var(--rule);
		display: flex;
		flex-direction: column;
	}

	.left-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		max-width: 480px;
		padding: 3rem 0;
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
		color: var(--ink-mid);
		text-decoration: none;
		transition: color 0.15s;
		align-self: flex-start;
	}

	.back:hover {
		color: var(--ink);
	}

	.eyebrow {
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-light);
		margin-bottom: 1.25rem;
	}

	h1 {
		font-family: var(--serif);
		font-size: clamp(2rem, 3.5vw, 3rem);
		line-height: 1.08;
		letter-spacing: -0.025em;
		margin-bottom: 1.25rem;
	}

	h1 em {
		font-style: italic;
		color: var(--accent);
	}

	.tagline {
		font-size: 0.9375rem;
		color: var(--ink-mid);
		line-height: 1.7;
		margin-bottom: 2rem;
		max-width: 40ch;
	}

	.features {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 2.5rem;
	}

	.feature {
		display: flex;
		align-items: flex-start;
		gap: 0.625rem;
		font-size: 0.875rem;
		color: var(--ink-mid);
	}

	.check {
		color: var(--accent);
		flex-shrink: 0;
		margin-top: 0.05rem;
	}

	.check-n {
		color: var(--ink-light);
		flex-shrink: 0;
		margin-top: 0.05rem;
	}

	.tranche-info {
		padding: 1.25rem;
		border: 1px solid var(--rule);
		border-left: 3px solid var(--accent);
		border-radius: 2px;
	}

	.tranche-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.tranche-name {
		font-size: 0.8125rem;
		color: var(--ink);
		font-weight: 400;
	}

	.tranche-remaining {
		font-size: 0.75rem;
		color: var(--ink-mid);
	}

	.slots-track {
		height: 3px;
		background: var(--rule);
		border-radius: 1px;
		overflow: hidden;
		margin-bottom: 0.625rem;
	}

	.slots-fill {
		height: 100%;
		background: var(--accent);
		border-radius: 1px;
	}

	.tranche-note {
		font-size: 0.75rem;
		color: var(--ink-light);
	}

	/* ── Right panel ── */
	.right {
		padding: 3rem 2.5rem 3rem 4rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fff;
	}

	.card {
		width: 100%;
		max-width: 420px;
	}

	/* ── State blocks (sold out / has license) ── */
	.state-block {
		text-align: center;
		padding: 2rem 0;
	}

	.state-icon {
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background: var(--accent-light);
		color: var(--accent);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		margin: 0 auto 1.5rem;
	}

	.state-icon.sold-out {
		background: #f5f5f5;
		color: var(--ink-light);
	}

	.state-block h2 {
		font-family: var(--serif);
		font-size: 1.75rem;
		letter-spacing: -0.02em;
		margin-bottom: 0.75rem;
	}

	.state-block p {
		font-size: 0.9375rem;
		color: var(--ink-mid);
		line-height: 1.6;
		margin-bottom: 2rem;
		max-width: 30ch;
		margin-left: auto;
		margin-right: auto;
	}

	/* ── Price block ── */
	.price-block {
		margin-bottom: 2rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--rule);
	}

	.price-amount {
		font-family: var(--serif);
		font-size: 4rem;
		line-height: 1;
		letter-spacing: -0.03em;
		margin-bottom: 0.375rem;
	}

	.price-amount sup {
		font-size: 1.5rem;
		vertical-align: super;
		font-family: var(--sans);
		font-weight: 300;
	}

	.price-note {
		font-size: 0.8125rem;
		color: var(--ink-light);
	}

	/* ── Login prompt ── */
	.login-prompt p {
		font-size: 0.9375rem;
		color: var(--ink-mid);
		margin-bottom: 1.25rem;
	}

	/* ── Card container ── */
	#card-container {
		margin: 0 0 1rem;
		min-height: 90px;
	}

	.loading {
		font-size: 0.875rem;
		color: var(--ink-light);
		margin: 0.5rem 0 1rem;
	}

	/* ── Error ── */
	.error-block {
		background: #fdf2f2;
		border: 1px solid #f5c1c1;
		border-radius: 2px;
		padding: 0.75rem 1rem;
		margin-bottom: 1rem;
	}

	.error-block p {
		font-size: 0.875rem;
		color: #a32d2d;
		margin: 0;
	}

	/* ── Pay button ── */
	.btn-pay {
		width: 100%;
		padding: 0.875rem;
		background: var(--ink);
		color: var(--cream);
		border: none;
		border-radius: 2px;
		font-size: 0.9375rem;
		font-family: var(--sans);
		font-weight: 400;
		cursor: pointer;
		transition: background 0.15s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.btn-pay:hover:not(:disabled) {
		background: #3a3530;
	}

	.btn-pay:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	/* ── Shared buttons ── */
	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--ink);
		color: var(--cream);
		padding: 0.875rem 2rem;
		border-radius: 2px;
		font-size: 0.9375rem;
		font-family: var(--sans);
		font-weight: 400;
		text-decoration: none;
		transition: background 0.15s;
	}

	.btn-primary:hover {
		background: #3a3530;
	}

	.btn-outline {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: transparent;
		color: var(--ink);
		border: 1px solid var(--ink);
		padding: 0.875rem 2rem;
		border-radius: 2px;
		font-size: 0.9375rem;
		font-family: var(--sans);
		font-weight: 400;
		text-decoration: none;
		transition: background 0.15s, color 0.15s;
	}

	.btn-outline:hover {
		background: var(--ink);
		color: var(--cream);
	}

	/* ── Secure note ── */
	.secure-note {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.75rem;
		color: var(--ink-light);
	}

	/* ── Spinner ── */
	.spinner {
		width: 14px;
		height: 14px;
		border: 1.5px solid rgba(255, 255, 255, 0.3);
		border-top-color: #fff;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
		flex-shrink: 0;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* ── Responsive ── */
	@media (max-width: 860px) {
		.page {
			grid-template-columns: 1fr;
		}

		.left {
			padding: 2rem 1.5rem;
			border-right: none;
			border-bottom: 1px solid var(--rule);
		}

		.left-content {
			padding: 1.5rem 0;
		}

		.right {
			padding: 2rem 1.5rem;
		}
	}
</style>