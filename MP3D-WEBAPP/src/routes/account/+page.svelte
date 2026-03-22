<script lang="ts">
	import type { PageData } from './$types';
	import { signOut } from '@auth/sveltekit/client';

	let { data }: { data: PageData } = $props();

	const resetDate = $derived(
		data.license
			? new Date(data.license.usageResetAt).toLocaleDateString('en-CA', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})
			: null
	);

	function getDownloadUrl(order: (typeof data.orders)[0]): string | null {
		if (!order.job || !order.downloadToken) return null;
		if (order.job.filesDeleted) return null;
		if (new Date(order.job.expiresAt) < new Date()) return null;
		return `/api/download/${order.job.id}?token=${order.downloadToken}`;
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('en-CA', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatExpiry(iso: string): string {
		const expiry = new Date(iso);
		const now = new Date();
		if (expiry < now) return 'Expired';
		return `Available until ${expiry.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })}`;
	}

	const statusLabels: Record<string, string> = {
		complete: 'Complete',
		pending: 'Pending',
		processing: 'Processing',
		failed: 'Failed'
	};
</script>

<svelte:head>
	<title>My Account — MyPhoto3D</title>
</svelte:head>

<div class="page">
	<div class="container">

		<!-- Page header -->
		<div class="page-header">
			<div>
				<p class="eyebrow">Account</p>
				<h1>My Account</h1>
				<p class="user-email">{data.user.email}</p>
			</div>
			<button class="btn-signout" onclick={() => signOut({ callbackUrl: '/' })}>
				Sign out
			</button>
		</div>

		<div class="layout">
			<div class="main-col">

				<!-- License card -->
				<section class="card">
					<div class="card-header">
						<h2>License</h2>
						{#if data.license}
							<span class="badge badge-active">Active</span>
						{:else}
							<span class="badge badge-inactive">No license</span>
						{/if}
					</div>

					{#if data.license}
						<p class="since">Member since {formatDate(data.license.createdAt)}</p>

						<div class="divider"></div>

						<div class="usage-rows">
							<div class="usage-row">
								<span class="usage-label">Account standing</span>
								<span class="pill pill-good">Good</span>
							</div>
							<div class="usage-row">
								<span class="usage-label">Fair use standing</span>
								{#if data.license.fairUseStatus === 'good'}
									<span class="pill pill-good">Good</span>
								{:else if data.license.fairUseStatus === 'warning'}
									<span class="pill pill-warning">Approaching limit</span>
								{:else}
									<span class="pill pill-exceeded">Limit reached</span>
								{/if}
							</div>
						</div>
						<p class="reset-note">Fair use resets on {resetDate}</p>

					{:else}
						<p class="no-license-note">
							You don't have an active license. Purchase lifetime access to start creating.
						</p>
						<a href="/buy" class="btn-primary">
							Get lifetime access
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						</a>
					{/if}
				</section>

				<!-- Order history -->
				<section class="card">
					<div class="card-header">
						<h2>Order History</h2>
						{#if data.orders.length > 0}
							<a href="/catalog" class="new-order-link">
								New order
								<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
							</a>
						{/if}
					</div>

					{#if data.orders.length === 0}
						<div class="empty-state">
							<p>No orders yet.</p>
							<a href="/catalog" class="btn-primary">
								Browse the catalog
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
							</a>
						</div>
					{:else}
						<div class="orders">
							{#each data.orders as order}
								<div class="order">
									<div class="order-top">
										<div class="order-left">
											<span class="order-slug">{order.itemSlug}</span>
											<span class="order-date">{formatDate(order.createdAt)}</span>
										</div>
										<div class="order-right">
											<span class="status-pill status-{order.status}">
												{statusLabels[order.status] ?? order.status}
											</span>
											<span class="delivery-method">{order.deliveryMethod}</span>
										</div>
									</div>

									{#if order.status === 'complete'}
										{#if order.job && !order.job.filesDeleted && new Date(order.job.expiresAt) > new Date()}
											{@const url = getDownloadUrl(order)}
											{#if url}
												<div class="order-download">
													<a href={url} class="download-btn" download>
														<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
															<path d="M8 2v8M5 7l3 3 3-3M3 13h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
														</svg>
														Download STL
													</a>
													<span class="expiry-note">{formatExpiry(order.job.expiresAt)}</span>
												</div>
											{/if}
										{:else}
											<p class="file-expired">File expired</p>
										{/if}
									{:else if order.status === 'processing' || order.status === 'pending'}
										<a href="/order/{order.id}" class="order-action-link">
											View status
											<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
												<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
											</svg>
										</a>
									{:else if order.status === 'failed'}
										<a href="/catalog/{order.itemSlug}" class="order-action-link">
											Try again
											<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
												<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
											</svg>
										</a>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</section>

			</div>
		</div>
	</div>
</div>

<style>
	.page {
		padding: 4rem 0 6rem;
	}

	.container {
		max-width: 760px;
		margin: 0 auto;
		padding: 0 2.5rem;
	}

	/* ── Page header ── */
	.page-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 3rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--rule);
	}

	.eyebrow {
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-light);
		margin-bottom: 0.5rem;
	}

	h1 {
		font-family: var(--serif);
		font-size: clamp(2rem, 3.5vw, 2.5rem);
		line-height: 1.08;
		letter-spacing: -0.025em;
		margin-bottom: 0.375rem;
	}

	.user-email {
		font-size: 0.875rem;
		color: var(--ink-light);
	}

	.btn-signout {
		background: none;
		border: 1px solid var(--rule);
		border-radius: 2px;
		padding: 0.5rem 1rem;
		font-size: 0.8125rem;
		color: var(--ink-mid);
		font-family: var(--sans);
		cursor: pointer;
		transition: border-color 0.15s, color 0.15s;
		white-space: nowrap;
	}

	.btn-signout:hover {
		border-color: var(--ink-mid);
		color: var(--ink);
	}

	/* ── Layout ── */
	.main-col {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* ── Cards ── */
	.card {
		border: 1px solid var(--rule);
		border-radius: 2px;
		padding: 1.75rem 2rem;
		background: #fff;
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.25rem;
	}

	.card-header h2 {
		font-family: var(--serif);
		font-size: 1.25rem;
		font-weight: 400;
		letter-spacing: -0.01em;
	}

	/* ── Badges ── */
	.badge {
		font-size: 0.6875rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 0.25rem 0.625rem;
		border-radius: 1px;
	}

	.badge-active {
		background: #eaf3de;
		color: #3b6d11;
	}

	.badge-inactive {
		background: #fcebeb;
		color: #a32d2d;
	}

	/* ── License ── */
	.since {
		font-size: 0.875rem;
		color: var(--ink-mid);
		margin-bottom: 1.25rem;
	}

	.divider {
		height: 1px;
		background: var(--rule);
		margin-bottom: 1.25rem;
	}

	.usage-rows {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.usage-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.usage-label {
		font-size: 0.875rem;
		color: var(--ink-mid);
	}

	.pill {
		font-size: 0.6875rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 0.25rem 0.625rem;
		border-radius: 1px;
	}

	.pill-good { background: #eaf3de; color: #3b6d11; }
	.pill-warning { background: #faeeda; color: #854f0b; }
	.pill-exceeded { background: #fcebeb; color: #a32d2d; }

	.reset-note {
		font-size: 0.75rem;
		color: var(--ink-light);
	}

	.no-license-note {
		font-size: 0.9375rem;
		color: var(--ink-mid);
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}

	/* ── Orders ── */
	.new-order-link {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.8125rem;
		color: var(--ink-mid);
		text-decoration: none;
		transition: color 0.15s;
	}

	.new-order-link:hover {
		color: var(--ink);
	}

	.empty-state {
		padding: 1rem 0;
	}

	.empty-state p {
		font-size: 0.9375rem;
		color: var(--ink-mid);
		margin-bottom: 1.25rem;
	}

	.orders {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.order {
		padding: 1.25rem 0;
		border-top: 1px solid var(--rule);
	}

	.order:last-child {
		border-bottom: 1px solid var(--rule);
	}

	.order-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.75rem;
	}

	.order-left {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.order-slug {
		font-size: 0.9375rem;
		color: var(--ink);
		font-weight: 400;
	}

	.order-date {
		font-size: 0.8125rem;
		color: var(--ink-light);
	}

	.order-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.25rem;
	}

	.status-pill {
		font-size: 0.6875rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 0.25rem 0.625rem;
		border-radius: 1px;
	}

	.status-complete { background: #eaf3de; color: #3b6d11; }
	.status-pending { background: #faeeda; color: #854f0b; }
	.status-processing { background: #e6f1fb; color: #185fa5; }
	.status-failed { background: #fcebeb; color: #a32d2d; }

	.delivery-method {
		font-size: 0.75rem;
		color: var(--ink-light);
		text-transform: capitalize;
	}

	.order-download {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.download-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
		color: var(--ink);
		text-decoration: none;
		border: 1px solid var(--rule);
		border-radius: 2px;
		padding: 0.375rem 0.75rem;
		transition: border-color 0.15s, background 0.15s;
	}

	.download-btn:hover {
		border-color: var(--ink-mid);
		background: var(--cream);
	}

	.expiry-note {
		font-size: 0.75rem;
		color: var(--ink-light);
	}

	.file-expired {
		font-size: 0.8125rem;
		color: var(--ink-light);
	}

	.order-action-link {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.8125rem;
		color: var(--ink-mid);
		text-decoration: none;
		transition: color 0.15s;
	}

	.order-action-link:hover {
		color: var(--ink);
	}

	/* ── Shared buttons ── */
	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--ink);
		color: var(--cream);
		padding: 0.75rem 1.5rem;
		border-radius: 2px;
		font-size: 0.875rem;
		font-family: var(--sans);
		font-weight: 400;
		text-decoration: none;
		transition: background 0.15s;
	}

	.btn-primary:hover {
		background: #3a3530;
	}

	/* ── Responsive ── */
	@media (max-width: 860px) {
		.page {
			padding: 2.5rem 0 4rem;
		}

		.page-header {
			flex-direction: column;
			gap: 1.5rem;
		}

		.card {
			padding: 1.25rem 1.5rem;
		}

		.order-top {
			flex-direction: column;
			gap: 0.75rem;
		}

		.order-right {
			align-items: flex-start;
			flex-direction: row;
			gap: 0.75rem;
		}
	}
</style>