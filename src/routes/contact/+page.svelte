<svelte:head>
	<title>Contact — MyPhoto3D</title>
	<meta name="description" content="Get in touch with MyPhoto3D." />
</svelte:head>

<div class="page">
	<div class="container">

		<div class="page-header">
			<p class="eyebrow">Get in touch</p>
			<h1>Contact us</h1>
		</div>

		<div class="layout">
			<div class="contact-block">
				<h2>Support</h2>
				<p>
					For questions about your license, order issues, account access, or anything
					else related to MyPhoto3D — email us and we'll get back to you as soon as
					possible.
				</p>
				<a href="mailto:support@myphoto3d.com" class="contact-link">
					support@myphoto3d.com
				</a>
			</div>

			<div class="contact-block">
				<h2>Legal &amp; privacy</h2>
				<p>
					For questions about our Terms of Service, Privacy Policy, data deletion
					requests, or intellectual property concerns — use the same email address.
				</p>
				<a href="mailto:legal@myphoto3d.com" class="contact-link">
					legal@myphoto3d.com
				</a>
			</div>

			<div class="contact-block">
				<h2>Mailing address</h2>
				<p>
					MyPhoto3D is operated by Parker Drouillard.
				</p>
				<address class="address">
					130 Vermont St.<br />
					LaSalle ON&nbsp; N9J 1C9<br />
					Canada
				</address>
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

	.page-header {
		margin-bottom: 3rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--rule);
	}

	.eyebrow {
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-light);
		margin-bottom: 0.75rem;
	}

	h1 {
		font-family: var(--serif);
		font-size: clamp(2rem, 3.5vw, 2.875rem);
		line-height: 1.08;
		letter-spacing: -0.025em;
	}

	.layout {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.contact-block {
		padding: 2rem 0;
		border-bottom: 1px solid var(--rule);
	}

	.contact-block:first-child {
		border-top: 1px solid var(--rule);
	}

	.contact-block h2 {
		font-family: var(--serif);
		font-size: 1.125rem;
		font-weight: 400;
		letter-spacing: -0.01em;
		margin-bottom: 0.75rem;
	}

	.contact-block p {
		font-size: 0.9375rem;
		color: var(--ink-mid);
		line-height: 1.7;
		max-width: 52ch;
		margin-bottom: 1rem;
	}

	.contact-link {
		font-size: 0.9375rem;
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 3px;
		transition: color 0.15s;
	}

	.contact-link:hover {
		color: var(--accent);
	}

	address {
		font-style: normal;
		font-size: 0.9375rem;
		color: var(--ink-mid);
		line-height: 1.8;
	}

	@media (max-width: 860px) {
		.page {
			padding: 2.5rem 0 4rem;
		}
	}
</style>