<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let files: FileList | null = $state(null);
	let submitting = $state(false);
	let errorMsg = $state('');

	const fileArray = $derived(files ? Array.from(files) : []);
	const fileCount = $derived(fileArray.length);
	const tooFew = $derived(fileCount > 0 && fileCount < data.item.minPhotos);
	const tooMany = $derived(fileCount > data.item.maxPhotos);
	const valid = $derived(fileCount >= data.item.minPhotos && fileCount <= data.item.maxPhotos);

	async function handleSubmit() {
		if (!valid || submitting) return;

		submitting = true;
		errorMsg = '';

		const formData = new FormData();
		formData.append('slug', data.item.slug);
		formData.append('deliveryMethod', 'both');
		for (const file of fileArray) {
			formData.append('photos', file);
		}

		try {
			const res = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			const json = await res.json();

			if (!res.ok) {
				errorMsg = json.message ?? 'Upload failed';
				submitting = false;
				return;
			}

			window.location.href = `/order/${json.orderId}`;
		} catch (e) {
			errorMsg = 'Network error, please try again.';
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>{data.item.name} — MyPhoto3D</title>
	<meta name="description" content="Upload your photos to create a {data.item.name} with MyPhoto3D." />
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

			<!-- Left: item info -->
			<div class="item-info">
				<div class="item-image">
					<img src={data.item.thumbnail} alt={data.item.name} />
				</div>
				<div class="item-meta">
					<p class="eyebrow">Product</p>
					<h1>{data.item.name}</h1>
					<p class="item-description">{data.item.description}</p>

					<div class="requirements">
						<div class="req-item">
							<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<rect x="2" y="4" width="12" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
								<circle cx="8" cy="9" r="2.5" stroke="currentColor" stroke-width="1.5"/>
								<path d="M5 4V3.5A1.5 1.5 0 0 1 6.5 2h3A1.5 1.5 0 0 1 11 3.5V4" stroke="currentColor" stroke-width="1.5"/>
							</svg>
							<span>{data.item.minPhotos}–{data.item.maxPhotos} photos required</span>
						</div>
						<div class="req-item">
							<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path d="M8 2v8M5 7l3 3 3-3M3 13h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
							<span>STL file delivered by email &amp; download</span>
						</div>
						<div class="req-item">
							<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
								<path d="M8 5v4M8 11v1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
							</svg>
							<span>JPEG, PNG, or HEIC — up to 50 MB each</span>
						</div>
					</div>

					{#if data.license}
						<div class="usage-note">
							<span>{data.license.monthlyUsage} generation{data.license.monthlyUsage === 1 ? '' : 's'} used this month</span>
						</div>
					{/if}
				</div>
			</div>

			<!-- Right: upload form -->
			<div class="upload-panel">
				<div class="upload-card">
					<h2>Upload your photos</h2>
					<p class="upload-intro">
						Select {data.item.minPhotos}–{data.item.maxPhotos} photos from different angles.
						Your STL file will be emailed to you and available for download.
					</p>

					<!-- Drop zone -->
					<label
						class="dropzone"
						class:has-files={fileCount > 0 && !tooMany}
						class:has-error={tooFew || tooMany}
						for="photos"
					>
						{#if fileCount === 0}
							<div class="dropzone-empty">
								<svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
									<path d="M16 22V10M10 16l6-6 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
									<rect x="4" y="4" width="24" height="24" rx="2" stroke="currentColor" stroke-width="1.5"/>
								</svg>
								<p>Click to select photos</p>
								<p class="dropzone-sub">JPEG, PNG, or HEIC — up to 50 MB each</p>
							</div>
						{:else}
							<div class="dropzone-filled">
								<div class="file-grid">
									{#each fileArray as file}
										<div class="file-thumb">
											<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
												<rect x="2" y="4" width="12" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
												<circle cx="8" cy="9" r="2" stroke="currentColor" stroke-width="1.5"/>
											</svg>
											<span>{file.name.length > 20 ? file.name.slice(0, 18) + '…' : file.name}</span>
										</div>
									{/each}
								</div>
								<p class="change-files">Click to change selection</p>
							</div>
						{/if}
						<input
							id="photos"
							type="file"
							accept="image/jpeg,image/png,image/heic,.heic"
							multiple
							onchange={(e) => {
								const target = e.target as HTMLInputElement;
								files = target.files;
							}}
						/>
					</label>

					<!-- Validation messages -->
					{#if tooFew}
						<div class="msg msg-error">
							Please select at least {data.item.minPhotos} photos.
						</div>
					{:else if tooMany}
						<div class="msg msg-error">
							Maximum {data.item.maxPhotos} photos allowed.
						</div>
					{:else if fileCount > 0 && valid}
						<div class="msg msg-success">
							{fileCount} photo{fileCount > 1 ? 's' : ''} selected — ready to generate.
						</div>
					{/if}

					{#if errorMsg}
						<div class="msg msg-error">{errorMsg}</div>
					{/if}

					<button
						class="btn-generate"
						disabled={!valid || submitting}
						onclick={handleSubmit}
					>
						{#if submitting}
							<span class="spinner"></span>
							Uploading...
						{:else}
							Generate STL
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						{/if}
					</button>

					<p class="privacy-note">
						<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<rect x="3" y="7" width="10" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>
							<path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
						</svg>
						Photos are deleted from our servers within 24 hours.
					</p>
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

	/* ── Item info ── */
	.item-image {
		aspect-ratio: 4 / 3;
		border-radius: 2px;
		overflow: hidden;
		background: #f0ece6;
		margin-bottom: 1.75rem;
		border: 1px solid var(--rule);
	}

	.item-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
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
		font-size: clamp(1.75rem, 3vw, 2.5rem);
		line-height: 1.08;
		letter-spacing: -0.025em;
		margin-bottom: 0.875rem;
	}

	.item-description {
		font-size: 0.9375rem;
		color: var(--ink-mid);
		line-height: 1.7;
		margin-bottom: 1.75rem;
	}

	.requirements {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		margin-bottom: 1.5rem;
	}

	.req-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--ink-mid);
	}

	.req-item svg {
		flex-shrink: 0;
		color: var(--ink-light);
	}

	.usage-note {
		font-size: 0.8125rem;
		color: var(--ink-light);
		padding: 0.75rem 1rem;
		border: 1px solid var(--rule);
		border-radius: 2px;
	}

	/* ── Upload panel ── */
	.upload-card {
		border: 1px solid var(--rule);
		border-radius: 2px;
		padding: 2rem;
		background: #fff;
		position: sticky;
		top: 5rem;
	}

	.upload-card h2 {
		font-family: var(--serif);
		font-size: 1.375rem;
		letter-spacing: -0.01em;
		font-weight: 400;
		margin-bottom: 0.5rem;
	}

	.upload-intro {
		font-size: 0.875rem;
		color: var(--ink-mid);
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}

	/* ── Drop zone ── */
	.dropzone {
		display: block;
		border: 1px dashed var(--rule);
		border-radius: 2px;
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s;
		margin-bottom: 1rem;
		position: relative;
	}

	.dropzone:hover {
		border-color: var(--ink-mid);
		background: var(--cream);
	}

	.dropzone.has-files {
		border-style: solid;
		border-color: var(--ink-light);
	}

	.dropzone.has-error {
		border-color: #e24b4a;
	}

	.dropzone input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
		width: 100%;
		height: 100%;
	}

	.dropzone-empty {
		padding: 2.5rem 1.5rem;
		text-align: center;
		color: var(--ink-light);
	}

	.dropzone-empty svg {
		margin: 0 auto 0.75rem;
		display: block;
	}

	.dropzone-empty p {
		font-size: 0.9375rem;
		color: var(--ink-mid);
		margin-bottom: 0.25rem;
	}

	.dropzone-sub {
		font-size: 0.8125rem;
		color: var(--ink-light) !important;
	}

	.dropzone-filled {
		padding: 1.25rem;
	}

	.file-grid {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.file-thumb {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
		color: var(--ink-mid);
	}

	.file-thumb svg {
		flex-shrink: 0;
		color: var(--ink-light);
	}

	.change-files {
		font-size: 0.75rem;
		color: var(--ink-light);
		text-align: center;
	}

	/* ── Messages ── */
	.msg {
		font-size: 0.8125rem;
		padding: 0.625rem 0.875rem;
		border-radius: 2px;
		margin-bottom: 1rem;
	}

	.msg-error {
		background: #fcebeb;
		color: #a32d2d;
		border: 1px solid #f09595;
	}

	.msg-success {
		background: #eaf3de;
		color: #3b6d11;
		border: 1px solid #c0dd97;
	}

	/* ── Generate button ── */
	.btn-generate {
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

	.btn-generate:hover:not(:disabled) {
		background: #3a3530;
	}

	.btn-generate:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	/* ── Privacy note ── */
	.privacy-note {
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
			padding: 2rem 0 4rem;
		}

		.layout {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.upload-card {
			position: static;
		}
	}
</style>