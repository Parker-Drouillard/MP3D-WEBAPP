<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	let status = $state(data.order.status);
	// svelte-ignore state_referenced_locally
	let jobStatus = $state(data.job?.status ?? null);
	// svelte-ignore state_referenced_locally
	let downloadToken = $state(data.order.downloadToken);
	// svelte-ignore state_referenced_locally
	let jobId = $state(data.job?.id ?? null);
	// svelte-ignore state_referenced_locally
	let expiresAt = $state(data.job?.expiresAt ? new Date(data.job.expiresAt) : null);

	let eventSource: EventSource | null = null;

	const orderId = $derived(data.order.id);

	const downloadUrl = $derived(
		jobId && downloadToken ? `/api/download/${jobId}?token=${downloadToken}` : null
	);

	function connectSSE() {
		if (status === 'complete' || status === 'failed') return;

		eventSource = new EventSource(`/api/order-status/${orderId}`);

		eventSource.onmessage = (event) => {
			const payload = JSON.parse(event.data);
			status = payload.status;
			jobStatus = payload.jobStatus;

			if (payload.downloadToken) downloadToken = payload.downloadToken;
			if (payload.jobId) jobId = payload.jobId;
			if (payload.expiresAt) expiresAt = new Date(payload.expiresAt);

			if (status === 'complete' || status === 'failed') {
				eventSource?.close();
			}
		};

		eventSource.onerror = () => {
			eventSource?.close();
			setTimeout(connectSSE, 5000);
		};
	}

	onMount(() => connectSSE());
	onDestroy(() => eventSource?.close());
</script>

<svelte:head>
	<title>Order Status — MyPhoto3D</title>
</svelte:head>

<div class="page">
	<div class="container">

		<a href="/catalog" class="back">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M13 8H3M7 4l-4 4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
			Back to catalog
		</a>

		<div class="layout">

			<!-- Left: order details -->
			<div class="order-info">
				<p class="eyebrow">Order</p>
				<h1>Your STL file<br /><em>is being prepared.</em></h1>

				<div class="meta-rows">
					<div class="meta-row">
						<span class="meta-label">Item</span>
						<span class="meta-value">{data.order.itemSlug}</span>
					</div>
					<div class="meta-row">
						<span class="meta-label">Order ID</span>
						<span class="meta-value mono">{data.order.id.slice(0, 8)}…</span>
					</div>
					<div class="meta-row">
						<span class="meta-label">Delivery</span>
						<span class="meta-value">Email &amp; download</span>
					</div>
				</div>

				<div class="info-note">
					<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
						<path d="M8 5v4M8 11v1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
					</svg>
					<p>
						You'll receive an email with your download link when the file is ready.
						You can also download it directly from this page.
					</p>
				</div>
			</div>

			<!-- Right: status panel -->
			<div class="status-panel">
				<div class="status-card">

					{#if status === 'pending' || status === 'processing'}
						<div class="state state-processing">
							<div class="spinner-wrap">
								<div class="spinner"></div>
							</div>
							<h2>
								{status === 'pending' ? 'Queued for generation' : 'Generating your file…'}
							</h2>
							<p>
								{status === 'pending'
									? 'Your order is in the queue. Generation will begin shortly.'
									: 'Your STL file is being generated. This usually takes a few minutes.'}
							</p>
							<p class="auto-update">This page updates automatically.</p>
						</div>

					{:else if status === 'complete'}
						<div class="state state-complete">
							<div class="complete-icon">
								<svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
									<path d="M6 16l8 8 12-12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</div>
							<h2>Your file is ready</h2>
							<p>
								A download link has also been sent to your email address.
							</p>

							{#if downloadUrl}
								<a href={downloadUrl} class="btn-download" download>
									<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
										<path d="M8 2v8M5 7l3 3 3-3M3 13h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
									Download STL file
								</a>
							{/if}

							{#if expiresAt}
								<p class="expiry-note">
									Available until {expiresAt.toLocaleDateString('en-CA', {
										month: 'long',
										day: 'numeric'
									})}
								</p>
							{/if}

							<div class="next-actions">
								<a href="/catalog" class="action-link">
									Create another
									<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
										<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
								</a>
								<a href="/account" class="action-link">
									View order history
									<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
										<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
								</a>
							</div>
						</div>

					{:else if status === 'failed'}
						<div class="state state-failed">
							<div class="failed-icon">
								<svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
									<path d="M10 10l12 12M22 10L10 22" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
								</svg>
							</div>
							<h2>Generation failed</h2>
							<p>
								Something went wrong generating your STL file. Please try again — if the
								problem persists, contact us at
								<a href="mailto:support@myphoto3d.com">support@myphoto3d.com</a>.
							</p>
							<a href="/catalog/{data.order.itemSlug}" class="btn-outline">
								Try again
							</a>
						</div>
					{/if}

				</div>
			</div>

		</div>
	</div>
</div>

<style>
	.page {
		padding: 3rem 0 6rem;
	}

	.container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 2.5rem;
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
		color: var(--ink-mid);
		text-decoration: none;
		transition: color 0.15s;
		margin-bottom: 2.5rem;
	}

	.back:hover {
		color: var(--ink);
	}

	/* ── Layout ── */
	.layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 5rem;
		align-items: start;
	}

	/* ── Order info ── */
	.eyebrow {
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-light);
		margin-bottom: 0.75rem;
	}

	h1 {
		font-family: var(--serif);
		font-size: clamp(1.75rem, 3vw, 2.75rem);
		line-height: 1.08;
		letter-spacing: -0.025em;
		margin-bottom: 2rem;
	}

	h1 em {
		font-style: italic;
		color: var(--accent);
	}

	.meta-rows {
		display: flex;
		flex-direction: column;
		gap: 0;
		margin-bottom: 2rem;
		border-top: 1px solid var(--rule);
	}

	.meta-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.875rem 0;
		border-bottom: 1px solid var(--rule);
	}

	.meta-label {
		font-size: 0.8125rem;
		color: var(--ink-light);
	}

	.meta-value {
		font-size: 0.875rem;
		color: var(--ink);
	}

	.mono {
		font-family: var(--mono, monospace);
		font-size: 0.8125rem;
	}

	.info-note {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
		padding: 1.25rem;
		border: 1px solid var(--rule);
		border-left: 3px solid var(--accent);
		border-radius: 2px;
	}

	.info-note svg {
		flex-shrink: 0;
		color: var(--accent);
		margin-top: 0.15rem;
	}

	.info-note p {
		font-size: 0.875rem;
		color: var(--ink-mid);
		line-height: 1.6;
		margin: 0;
	}

	/* ── Status card ── */
	.status-card {
		border: 1px solid var(--rule);
		border-radius: 2px;
		padding: 2.5rem 2rem;
		background: #fff;
		position: sticky;
		top: 5rem;
	}

	.state {
		text-align: center;
	}

	.state h2 {
		font-family: var(--serif);
		font-size: 1.5rem;
		font-weight: 400;
		letter-spacing: -0.01em;
		margin-bottom: 0.75rem;
	}

	.state p {
		font-size: 0.9375rem;
		color: var(--ink-mid);
		line-height: 1.6;
		max-width: 32ch;
		margin: 0 auto 1rem;
	}

	/* ── Processing state ── */
	.spinner-wrap {
		display: flex;
		justify-content: center;
		margin-bottom: 1.5rem;
	}

	.spinner {
		width: 44px;
		height: 44px;
		border: 2px solid var(--rule);
		border-top-color: var(--ink);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.auto-update {
		font-size: 0.75rem !important;
		color: var(--ink-light) !important;
	}

	/* ── Complete state ── */
	.complete-icon {
		width: 4rem;
		height: 4rem;
		border-radius: 50%;
		background: var(--accent-light);
		color: var(--accent);
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1.5rem;
	}

	.btn-download {
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
		margin-bottom: 0.875rem;
	}

	.btn-download:hover {
		background: #3a3530;
	}

	.expiry-note {
		font-size: 0.75rem !important;
		color: var(--ink-light) !important;
		margin-bottom: 2rem !important;
	}

	.next-actions {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--rule);
	}

	.action-link {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.8125rem;
		color: var(--ink-mid);
		text-decoration: none;
		transition: color 0.15s;
	}

	.action-link:hover {
		color: var(--ink);
	}

	/* ── Failed state ── */
	.failed-icon {
		width: 4rem;
		height: 4rem;
		border-radius: 50%;
		background: #fcebeb;
		color: #a32d2d;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1.5rem;
	}

	.state-failed p a {
		color: var(--ink);
	}

	.btn-outline {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: transparent;
		color: var(--ink);
		border: 1px solid var(--ink);
		padding: 0.75rem 1.5rem;
		border-radius: 2px;
		font-size: 0.875rem;
		font-family: var(--sans);
		text-decoration: none;
		transition: background 0.15s, color 0.15s;
		margin-top: 0.5rem;
	}

	.btn-outline:hover {
		background: var(--ink);
		color: var(--cream);
	}

	/* ── Responsive ── */
	@media (max-width: 860px) {
		.page {
			padding: 2rem 0 4rem;
		}

		.layout {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.status-card {
			position: static;
		}
	}
</style>