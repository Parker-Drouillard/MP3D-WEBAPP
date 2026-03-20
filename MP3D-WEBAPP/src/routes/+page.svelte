<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>MyPhoto3D — Lifetime 3D Print Studio</title>
	<meta name="description" content="Upload 2–5 photos, receive a print-ready STL file. One-time $300 CAD lifetime license — no subscription, no per-file fees." />
</svelte:head>

<nav>
	<div class="container nav-inner">
		<a href="/" class="logo">MyPhoto<span>3D</span></a>
		<ul class="nav-links">
			<li><a href="/catalog">Catalog</a></li>
			<li><a href="#how-it-works">How it works</a></li>
			<li><a href="#for-sellers">For sellers</a></li>
			<li><a href="/auth/login">Sign in</a></li>
			<li><a href="/buy" class="nav-cta">Get access</a></li>
		</ul>
	</div>
</nav>

<main>

	<section class="hero">
		<div class="container">
			<div class="hero-layout">
				<div>
					<p class="hero-eyebrow">Lifetime 3D Print Studio</p>
					<h1 class="hero-headline">Upload a photo.<br /><em>Print the object.</em></h1>
					<p class="hero-body">
						Send us 2–5 photos of anything in your catalog. We generate a precision STL file,
						ready to print — delivered to your inbox or downloaded instantly.
					</p>
					<div class="hero-actions">
						<a href="/buy" class="btn-primary">
							Get lifetime access
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						</a>
						<span class="hero-note"><strong>$300 CAD</strong> — one time, no subscription</span>
					</div>
					<div class="step-list">
						<div class="step-item">
							<span class="step-num">1</span>
							<div class="step-text">
								<strong>Choose from the catalog</strong>
								Browse available item types for 3D printing.
							</div>
						</div>
						<div class="step-item">
							<span class="step-num">2</span>
							<div class="step-text">
								<strong>Upload your photos</strong>
								2–5 clear photos from different angles. JPEG, PNG, or HEIC.
							</div>
						</div>
						<div class="step-item">
							<span class="step-num">3</span>
							<div class="step-text">
								<strong>Receive your STL file</strong>
								Download directly or get it in your inbox — ready to print.
							</div>
						</div>
					</div>
				</div>
				<div class="hero-visual">
					<div class="stl-preview">
						<div class="stl-grid" aria-hidden="true"></div>
						<div class="stl-obj" aria-hidden="true">
							<svg width="160" height="160" viewBox="0 0 160 160" fill="none">
								<g opacity="0.15" stroke="#1A1714" stroke-width="0.5">
									<line x1="80" y1="20" x2="30" y2="70" /><line x1="80" y1="20" x2="130" y2="70" />
									<line x1="80" y1="20" x2="80" y2="130" />
									<line x1="30" y1="70" x2="80" y2="130" /><line x1="130" y1="70" x2="80" y2="130" />
									<line x1="30" y1="70" x2="130" y2="70" />
								</g>
								<g stroke="#1A1714" stroke-width="1" stroke-linejoin="round">
									<polygon points="80,22 132,68 80,128 28,68" fill="none" />
									<line x1="80" y1="22" x2="80" y2="128" stroke-dasharray="4 3" />
									<line x1="28" y1="68" x2="132" y2="68" stroke-dasharray="4 3" />
								</g>
								<g stroke="#C8522A" stroke-width="1.5">
									<line x1="80" y1="22" x2="132" y2="68" />
									<line x1="132" y1="68" x2="80" y2="128" />
									<line x1="80" y1="22" x2="28" y2="68" />
									<line x1="28" y1="68" x2="80" y2="128" />
								</g>
								<circle cx="80" cy="22" r="3" fill="#C8522A" />
								<circle cx="132" cy="68" r="3" fill="#1A1714" opacity="0.35" />
								<circle cx="28" cy="68" r="3" fill="#1A1714" opacity="0.35" />
								<circle cx="80" cy="128" r="3" fill="#1A1714" opacity="0.35" />
							</svg>
						</div>
						<div class="stl-label">
							<span>output.stl</span>
							<span class="stl-badge">Ready to print</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="stats" aria-label="License availability">
		<div class="container">
			<div class="stats-inner">
				<div class="stat">
					<div class="stat-num">{data.total.toLocaleString()}</div>
					<div class="stat-label">Lifetime licenses available</div>
				</div>
				<div class="stat">
					<div class="stat-num stat-accent">{data.remaining.toLocaleString()}</div>
					<div class="stat-label">Licenses remaining</div>
				</div>
				<div class="stat">
					<div class="stat-num">$300</div>
					<div class="stat-label">CAD — one time payment</div>
				</div>
				<div class="stat">
					<div class="stat-num">∞</div>
					<div class="stat-label">Lifetime access, no expiry</div>
				</div>
			</div>
		</div>
	</section>

	<section class="how" id="how-it-works">
		<div class="container">
			<p class="section-label">How it works</p>
			<div class="how-grid">
				<div class="how-card">
					<div class="how-card-num" aria-hidden="true">01</div>
					<h3 class="how-card-title">Browse the catalog</h3>
					<p class="how-card-body">
						Choose from a growing library of item types — each one tuned for accurate
						photo-to-STL conversion.
					</p>
				</div>
				<div class="how-card">
					<div class="how-card-num" aria-hidden="true">02</div>
					<h3 class="how-card-title">Upload your photos</h3>
					<p class="how-card-body">
						2 to 5 photographs from different angles. JPEG, PNG, or HEIC — up to 50 MB each.
						Photos are deleted from our servers after 24 hours.
					</p>
				</div>
				<div class="how-card">
					<div class="how-card-num" aria-hidden="true">03</div>
					<h3 class="how-card-title">Receive your STL</h3>
					<p class="how-card-body">
						We generate the model and email you a secure download link, or you can grab it
						straight from the order page. Your file, your printer.
					</p>
				</div>
			</div>
		</div>
	</section>

	<section class="business" id="for-sellers">
		<div class="container">
			<div class="business-inner">
				<div class="business-text">
					<p class="eyebrow">For makers &amp; sellers</p>
					<h2>Turn photos into<br /><em>products you can sell.</em></h2>
					<p>
						A lot of our users run tables at craft fairs, farmers markets, and trade shows. They
						photograph items — keepsakes, figurines, custom parts — generate the STL, print it,
						and sell the result on the spot.
					</p>
					<p>
						There's no licensing restriction on what you do with your STL files. Print them, sell
						the prints, make it a business — that's exactly the kind of use we had in mind.
					</p>
					<div class="payback">
						<p>
							<strong>The math is simple.</strong> Sell two or three printed items and the license
							has paid for itself. Everything after that is margin.
						</p>
					</div>
				</div>
				<div class="use-cases">
					<div class="use-case">
						<div class="uc-icon" aria-hidden="true">
							<svg viewBox="0 0 16 16" fill="none" stroke="#C8522A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
								<circle cx="8" cy="6" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
							</svg>
						</div>
						<div>
							<p class="uc-title">Custom figurines &amp; portraits</p>
							<p class="uc-body">Photograph a person, a pet, or a character. Generate a printable model. A perennial bestseller at any fair.</p>
						</div>
					</div>
					<div class="use-case">
						<div class="uc-icon" aria-hidden="true">
							<svg viewBox="0 0 16 16" fill="none" stroke="#C8522A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
								<rect x="2" y="4" width="12" height="9" rx="1" /><path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
							</svg>
						</div>
						<div>
							<p class="uc-title">Keepsakes &amp; collectibles</p>
							<p class="uc-body">Turn heirlooms, trophies, or sentimental objects into printable replicas. Ideal for memorial or commemorative work.</p>
						</div>
					</div>
					<div class="use-case">
						<div class="uc-icon" aria-hidden="true">
							<svg viewBox="0 0 16 16" fill="none" stroke="#C8522A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
								<path d="M3 13V7l5-5 5 5v6" /><path d="M6 13v-4h4v4" />
							</svg>
						</div>
						<div>
							<p class="uc-title">Architectural &amp; product models</p>
							<p class="uc-body">Photograph small structures or product prototypes and produce accurate scale models for display or presentation.</p>
						</div>
					</div>
					<div class="use-case">
						<div class="uc-icon" aria-hidden="true">
							<svg viewBox="0 0 16 16" fill="none" stroke="#C8522A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
								<path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5z" />
							</svg>
						</div>
						<div>
							<p class="uc-title">One-off custom orders</p>
							<p class="uc-body">Customers bring you an object, you photograph it on the spot, generate the STL, and queue it for printing. Done before the fair closes.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="pricing">
		<div class="container">
			<div class="pricing-inner">
				<div class="pricing-text">
					<p class="eyebrow">Pricing</p>
					<h2>One price.<br />Permanent access.</h2>
					<p>
						No monthly fees. No per-file charges. Buy once and use the platform for as long as it
						exists. There are a fixed number of licenses — once they're gone, they're gone.
					</p>
				</div>
				<div class="pricing-card">
					<div class="price-amount"><sup>$</sup>300</div>
					<p class="price-note">CAD &nbsp;·&nbsp; One-time payment &nbsp;·&nbsp; Lifetime license</p>
					<ul class="feature-list">
						<li><span class="check-n" aria-hidden="true">—</span><span>No recurring subscription</span></li>
						<li><span class="check-y" aria-hidden="true">✓</span><span>Full catalog access, forever</span></li>
						<li><span class="check-y" aria-hidden="true">✓</span><span>STL files by email or instant download</span></li>
						<li><span class="check-y" aria-hidden="true">✓</span><span>Use your prints however you like — including for sale</span></li>
						<li><span class="check-y" aria-hidden="true">✓</span><span>HEIC, JPEG, and PNG photo uploads</span></li>
						<li><span class="check-y" aria-hidden="true">✓</span><span>Sign in with Google or GitHub</span></li>
					</ul>
					<div class="slots-bar">
						<div class="slots-track">
							<div class="slots-fill" style="width: {data.percentSold}%"></div>
						</div>
						<p class="slots-text">
							<strong>{data.remaining.toLocaleString()} of {data.total.toLocaleString()} licenses</strong> still available
						</p>
					</div>
					<a href="/buy" class="btn-primary" style="width: 100%; justify-content: center;">
						Purchase lifetime access
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</a>
				</div>
			</div>
		</div>
	</section>

</main>

<footer>
	<div class="container">
		<div class="footer-top">
			<div class="footer-brand">
				<a href="/" class="logo">MyPhoto<span>3D</span></a>
				<p>Photo to STL — for makers, sellers, and anyone with a 3D printer.</p>
			</div>
			<div class="footer-nav">
				<div class="footer-col">
					<h4>Product</h4>
					<ul>
						<li><a href="/catalog">Catalog</a></li>
						<li><a href="#how-it-works">How it works</a></li>
						<li><a href="/buy">Pricing</a></li>
						<li><a href="/auth/login">Sign in</a></li>
					</ul>
				</div>
				<div class="footer-col">
					<h4>Company</h4>
					<ul>
						<li><a href="mailto:hello@myphoto3d.ca">Contact</a></li>
						<li><a href="/privacy">Privacy Policy</a></li>
						<li><a href="/terms">Terms of Service</a></li>
					</ul>
				</div>
			</div>
		</div>
		<div class="footer-bottom">
			<p>© {new Date().getFullYear()} MyPhoto3D. All rights reserved.</p>
			<div class="footer-legal">
				<a href="/privacy">Privacy Policy</a>
				<a href="/terms">Terms of Service</a>
			</div>
		</div>
	</div>
</footer>

<style>
	.container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 2.5rem;
	}

	/* ── Nav ── */
	nav {
		border-bottom: 1px solid var(--rule);
		padding: 1.25rem 0;
	}

	.nav-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo {
		font-family: var(--serif);
		font-size: 1.2rem;
		letter-spacing: -0.01em;
		color: var(--ink);
		text-decoration: none;
	}

	.logo span {
		color: var(--accent);
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 2rem;
		list-style: none;
	}

	.nav-links a {
		font-size: 0.875rem;
		color: var(--ink-mid);
		text-decoration: none;
		transition: color 0.15s;
	}

	.nav-links a:hover {
		color: var(--ink);
	}

	.nav-cta {
		background: var(--ink);
		color: var(--cream) !important;
		padding: 0.5rem 1.25rem;
		border-radius: 2px;
		font-size: 0.8125rem !important;
		letter-spacing: 0.03em !important;
	}

	.nav-cta:hover {
		background: #3a3530;
	}

	/* ── Hero ── */
	.hero {
		padding: 6rem 0 5rem;
		border-bottom: 1px solid var(--rule);
	}

	.hero-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 5rem;
		align-items: start;
	}

	.hero-eyebrow {
		font-size: 0.75rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--accent);
		margin-bottom: 1.75rem;
		font-weight: 400;
		animation: fadeUp 0.5s ease both;
	}

	.hero-headline {
		font-family: var(--serif);
		font-size: clamp(2.75rem, 5.5vw, 5rem);
		line-height: 1.06;
		letter-spacing: -0.025em;
		max-width: 16ch;
		margin-bottom: 2rem;
		animation: fadeUp 0.55s 0.07s ease both;
	}

	.hero-headline em {
		font-style: italic;
		color: var(--accent);
	}

	.hero-body {
		font-size: 1.0625rem;
		color: var(--ink-mid);
		max-width: 42ch;
		line-height: 1.7;
		margin-bottom: 2.75rem;
		font-weight: 300;
		animation: fadeUp 0.55s 0.14s ease both;
	}

	.hero-actions {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		flex-wrap: wrap;
		animation: fadeUp 0.55s 0.21s ease both;
	}

	.hero-note {
		font-size: 0.8125rem;
		color: var(--ink-light);
	}

	.hero-note strong {
		color: var(--ink-mid);
		font-weight: 400;
	}

	.hero-visual {
		padding-top: 3rem;
		animation: fadeUp 0.6s 0.28s ease both;
	}

	.stl-preview {
		background: #f0ece6;
		border-radius: 2px;
		aspect-ratio: 4 / 3;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--rule);
		overflow: hidden;
		position: relative;
	}

	.stl-grid {
		position: absolute;
		inset: 0;
		background-image: linear-gradient(var(--rule) 1px, transparent 1px),
			linear-gradient(90deg, var(--rule) 1px, transparent 1px);
		background-size: 32px 32px;
		opacity: 0.6;
	}

	.stl-obj {
		position: relative;
		z-index: 1;
	}

	.stl-label {
		position: absolute;
		bottom: 1rem;
		left: 1rem;
		right: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.stl-label span {
		font-size: 0.6875rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-mid);
	}

	.stl-badge {
		background: var(--ink);
		color: var(--cream);
		font-size: 0.625rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 0.25rem 0.625rem;
		border-radius: 1px;
	}

	.step-list {
		margin-top: 2rem;
	}

	.step-item {
		display: grid;
		grid-template-columns: 2rem 1fr;
		gap: 0.75rem;
		padding: 1rem 0;
		border-top: 1px solid var(--rule);
	}

	.step-item:last-child {
		border-bottom: 1px solid var(--rule);
	}

	.step-num {
		font-family: var(--serif);
		font-size: 1.125rem;
		color: var(--ink-light);
		padding-top: 0.1rem;
	}

	.step-text {
		font-size: 0.875rem;
		color: var(--ink-mid);
		line-height: 1.6;
	}

	.step-text strong {
		color: var(--ink);
		font-weight: 400;
		display: block;
		margin-bottom: 0.2rem;
	}

	/* ── Stats ── */
	.stats {
		padding: 2.5rem 0;
		border-bottom: 1px solid var(--rule);
	}

	.stats-inner {
		display: flex;
	}

	.stat {
		flex: 1;
		padding: 0 2rem;
		border-right: 1px solid var(--rule);
	}

	.stat:first-child {
		padding-left: 0;
	}

	.stat:last-child {
		border-right: none;
	}

	.stat-num {
		font-family: var(--serif);
		font-size: 2.25rem;
		line-height: 1;
		margin-bottom: 0.375rem;
	}

	.stat-accent {
		color: var(--accent);
	}

	.stat-label {
		font-size: 0.8125rem;
		color: var(--ink-mid);
	}

	/* ── How it works ── */
	.how {
		padding: 5rem 0;
		border-bottom: 1px solid var(--rule);
	}

	.section-label {
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-light);
		margin-bottom: 3rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.section-label::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--rule);
	}

	.how-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2px;
		background: var(--rule);
	}

	.how-card {
		background: var(--cream);
		padding: 2.5rem 2rem;
	}

	.how-card-num {
		font-family: var(--serif);
		font-size: 3.5rem;
		color: var(--rule);
		line-height: 1;
		margin-bottom: 1.25rem;
		letter-spacing: -0.03em;
	}

	.how-card-title {
		font-size: 1rem;
		color: var(--ink);
		margin-bottom: 0.625rem;
		font-weight: 400;
	}

	.how-card-body {
		font-size: 0.875rem;
		color: var(--ink-mid);
		line-height: 1.65;
	}

	/* ── Business / For sellers ── */
	.business {
		padding: 5rem 0;
		border-bottom: 1px solid var(--rule);
		background: #fff;
	}

	.business-inner {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 5rem;
		align-items: start;
	}

	.eyebrow {
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-light);
		margin-bottom: 1.25rem;
	}

	.business-text h2 {
		font-family: var(--serif);
		font-size: clamp(1.875rem, 3vw, 2.625rem);
		line-height: 1.1;
		letter-spacing: -0.02em;
		margin-bottom: 1.5rem;
	}

	.business-text h2 em {
		font-style: italic;
		color: var(--accent);
	}

	.business-text p {
		font-size: 0.9375rem;
		color: var(--ink-mid);
		line-height: 1.75;
		margin-bottom: 1rem;
	}

	.payback {
		margin-top: 2rem;
		padding: 1.5rem;
		border: 1px solid var(--rule);
		border-radius: 2px;
		border-left: 3px solid var(--accent);
	}

	.payback p {
		font-size: 0.875rem;
		color: var(--ink-mid);
		line-height: 1.6;
		margin: 0;
	}

	.payback p strong {
		color: var(--ink);
		font-weight: 400;
	}

	.use-cases {
		display: flex;
		flex-direction: column;
		gap: 2px;
		background: var(--rule);
	}

	.use-case {
		background: #fff;
		padding: 1.75rem 2rem;
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 1.25rem;
		align-items: start;
	}

	.uc-icon {
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 2px;
		background: var(--accent-light);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.uc-icon svg {
		width: 1rem;
		height: 1rem;
	}

	.uc-title {
		font-size: 0.9375rem;
		color: var(--ink);
		font-weight: 400;
		margin-bottom: 0.375rem;
	}

	.uc-body {
		font-size: 0.8125rem;
		color: var(--ink-mid);
		line-height: 1.6;
	}

	/* ── Pricing ── */
	.pricing {
		padding: 5rem 0;
		border-bottom: 1px solid var(--rule);
	}

	.pricing-inner {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: center;
	}

	.pricing-text h2 {
		font-family: var(--serif);
		font-size: clamp(2rem, 3.5vw, 2.875rem);
		line-height: 1.1;
		letter-spacing: -0.02em;
		margin-bottom: 1.25rem;
	}

	.pricing-text p {
		font-size: 0.9375rem;
		color: var(--ink-mid);
		line-height: 1.7;
		max-width: 38ch;
	}

	.pricing-card {
		border: 1px solid var(--rule);
		border-radius: 2px;
		padding: 2.5rem;
		background: #fff;
	}

	.price-amount {
		font-family: var(--serif);
		font-size: 3.75rem;
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
		margin-bottom: 2rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--rule);
	}

	.feature-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		margin-bottom: 2rem;
	}

	.feature-list li {
		font-size: 0.875rem;
		color: var(--ink-mid);
		display: flex;
		align-items: flex-start;
		gap: 0.625rem;
		line-height: 1.5;
	}

	.check-y {
		color: var(--accent);
		flex-shrink: 0;
		margin-top: 0.05rem;
	}

	.check-n {
		color: var(--rule);
		flex-shrink: 0;
		margin-top: 0.05rem;
	}

	.slots-bar {
		margin-bottom: 2rem;
	}

	.slots-track {
		height: 3px;
		background: var(--rule);
		border-radius: 1px;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}

	.slots-fill {
		height: 100%;
		background: var(--accent);
		border-radius: 1px;
		transition: width 0.6s ease;
	}

	.slots-text {
		font-size: 0.75rem;
		color: var(--ink-light);
	}

	.slots-text strong {
		color: var(--ink-mid);
		font-weight: 400;
	}

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

	.btn-primary:hover :global(svg) {
		transform: translateX(3px);
	}

	.btn-primary :global(svg) {
		transition: transform 0.2s;
	}

	/* ── Footer ── */
	footer {
		padding: 3rem 0;
	}

	.footer-top {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 4rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--rule);
		margin-bottom: 1.5rem;
		align-items: start;
	}

	.footer-brand p {
		font-size: 0.8125rem;
		color: var(--ink-light);
		max-width: 30ch;
		line-height: 1.6;
		margin-top: 0.75rem;
	}

	.footer-nav {
		display: flex;
		gap: 3rem;
	}

	.footer-col h4 {
		font-size: 0.6875rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-light);
		margin-bottom: 1rem;
		font-weight: 400;
	}

	.footer-col ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.footer-col a {
		font-size: 0.8125rem;
		color: var(--ink-mid);
		text-decoration: none;
		transition: color 0.15s;
	}

	.footer-col a:hover {
		color: var(--ink);
	}

	.footer-bottom {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.footer-bottom p {
		font-size: 0.75rem;
		color: var(--ink-light);
	}

	.footer-legal {
		display: flex;
		gap: 1.5rem;
	}

	.footer-legal a {
		font-size: 0.75rem;
		color: var(--ink-light);
		text-decoration: none;
		transition: color 0.15s;
	}

	.footer-legal a:hover {
		color: var(--ink-mid);
	}

	/* ── Animations ── */
	@keyframes fadeUp {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* ── Responsive ── */
	@media (max-width: 860px) {
		.hero-layout,
		.pricing-inner,
		.business-inner {
			grid-template-columns: 1fr;
			gap: 3rem;
		}

		.hero-visual {
			padding-top: 0;
		}

		.stats-inner {
			flex-wrap: wrap;
		}

		.stat {
			flex: 1 1 40%;
			border-right: none;
			border-bottom: 1px solid var(--rule);
			padding: 1rem 0;
		}

		.how-grid {
			grid-template-columns: 1fr;
		}

		.footer-top {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.footer-bottom {
			flex-direction: column;
			text-align: center;
		}
	}
</style>