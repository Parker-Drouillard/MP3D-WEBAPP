<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Catalog — MyPhoto3D</title>
	<meta name="description" content="Browse the MyPhoto3D catalog and choose a product to create with your photos." />
</svelte:head>

<div class="page">
	<div class="container">
		<div class="page-header">
			<div>
				<p class="eyebrow">Your library</p>
				<h1>Choose a product</h1>
			</div>
			<p class="header-note">
				Each product is designed to carry your photos inside it — revealed when light shines through.
			</p>
		</div>

		<div class="grid">
			{#each data.items as item}
				<a href="/catalog/{item.slug}" class="card">
					<div class="card-image">
						<img src={item.thumbnail} alt={item.name} />
					</div>
					<div class="card-body">
						<h2>{item.name}</h2>
						<p>{item.description}</p>
						<div class="card-footer">
							<span class="photo-req">
								<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<rect x="2" y="4" width="12" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
									<circle cx="8" cy="9" r="2.5" stroke="currentColor" stroke-width="1.5"/>
									<path d="M5 4V3.5A1.5 1.5 0 0 1 6.5 2h3A1.5 1.5 0 0 1 11 3.5V4" stroke="currentColor" stroke-width="1.5"/>
								</svg>
								{item.minPhotos}–{item.maxPhotos} photos
							</span>
							<span class="arrow">
								<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</span>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</div>

<style>
	.page {
		padding: 4rem 0 6rem;
	}

	.container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 2.5rem;
	}

	/* ── Header ── */
	.page-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 2rem;
		margin-bottom: 3rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--rule);
	}

	.eyebrow {
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-light);
		margin-bottom: 0.625rem;
	}

	h1 {
		font-family: var(--serif);
		font-size: clamp(2rem, 3.5vw, 2.875rem);
		line-height: 1.08;
		letter-spacing: -0.025em;
	}

	.header-note {
		font-size: 0.875rem;
		color: var(--ink-mid);
		max-width: 36ch;
		line-height: 1.6;
		text-align: right;
	}

	/* ── Grid ── */
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2px;
		background: var(--rule);
	}

	/* ── Card ── */
	.card {
		background: var(--cream);
		display: flex;
		flex-direction: column;
		text-decoration: none;
		color: inherit;
		transition: background 0.15s;
	}

	.card:hover {
		background: #fff;
	}

	.card:hover .arrow {
		transform: translateX(3px);
	}

	.card-image {
		aspect-ratio: 4 / 3;
		overflow: hidden;
		background: #f0ece6;
	}

	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.4s ease;
	}

	.card:hover .card-image img {
		transform: scale(1.03);
	}

	.card-body {
		padding: 1.5rem;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.card-body h2 {
		font-family: var(--serif);
		font-size: 1.25rem;
		letter-spacing: -0.01em;
		margin-bottom: 0.5rem;
		font-weight: 400;
	}

	.card-body p {
		font-size: 0.875rem;
		color: var(--ink-mid);
		line-height: 1.6;
		flex: 1;
		margin-bottom: 1.25rem;
	}

	.card-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 1rem;
		border-top: 1px solid var(--rule);
	}

	.photo-req {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.75rem;
		color: var(--ink-light);
		letter-spacing: 0.01em;
	}

	.arrow {
		color: var(--ink-mid);
		display: flex;
		align-items: center;
		transition: transform 0.2s;
	}

	/* ── Responsive ── */
	@media (max-width: 860px) {
		.page {
			padding: 2.5rem 0 4rem;
		}

		.page-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.header-note {
			text-align: left;
		}

		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>