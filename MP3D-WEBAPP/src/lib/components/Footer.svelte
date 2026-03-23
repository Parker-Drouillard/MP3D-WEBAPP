<footer>
	<div class="container">
		<div class="footer-top">
			<div class="footer-brand">
				<a href="/" class="logo">MyPhoto<span>3D</span></a>
				<p>Photo to STL — for makers, sellers, and anyone with a 3D printer.</p>
				<p class="address">130 Vermont St., LaSalle ON N9J 1C9</p>
			</div>
			<div class="footer-nav">
				<div class="footer-col">
					<h4>Product</h4>
					<ul>
						<li><a href="/catalog">Catalog</a></li>
						<li><a href="/#how-it-works">How it works</a></li>
						<li><a href="/buy">Pricing</a></li>
					</ul>
				</div>
				<div class="footer-col">
					<h4>Company</h4>
					<ul>
					<li><a href="/contact">Contact</a></li>					</ul>
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
	footer {
		padding: 3rem 0;
		border-top: 1px solid var(--rule);
		background: var(--cream);
	}

	.container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 2.5rem;
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

	.footer-brand .logo {
		font-family: var(--serif);
		font-size: 1.2rem;
		letter-spacing: -0.01em;
		color: var(--ink);
		text-decoration: none;
		display: block;
		margin-bottom: 0.75rem;
	}

	.footer-brand .logo span {
		color: var(--accent);
	}

	.footer-brand p {
		font-size: 0.8125rem;
		color: var(--ink-light);
		max-width: 30ch;
		line-height: 1.6;
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

	.footer-brand .address {
		font-size: 0.75rem;
		color: var(--ink-light);
		margin-top: 0.25rem;
	}

	@media (max-width: 860px) {
		.footer-top {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.footer-bottom {
			flex-direction: column;
			text-align: center;
		}

		.footer-legal {
			justify-content: center;
		}
	}
</style>