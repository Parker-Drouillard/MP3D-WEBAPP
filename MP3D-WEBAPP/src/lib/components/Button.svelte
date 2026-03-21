<script lang="ts">
	type Props = {
		href?: string;
		variant?: 'primary' | 'outline';
		fullWidth?: boolean;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		onclick?: () => void;
		children: import('svelte').Snippet;
	};

	let {
		href,
		variant = 'primary',
		fullWidth = false,
		type = 'button',
		disabled = false,
		onclick,
		children
	}: Props = $props();
</script>

{#if href}
	
		{href}
		class="btn btn-{variant}"
		class:full-width={fullWidth}
	>
		{@render children()}
	</a>
{:else}
	<button
		{type}
		{disabled}
		{onclick}
		class="btn btn-{variant}"
		class:full-width={fullWidth}
	>
		{@render children()}
	</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.875rem 2rem;
		border-radius: 2px;
		font-size: 0.9375rem;
		font-family: var(--sans);
		font-weight: 400;
		text-decoration: none;
		cursor: pointer;
		transition: background 0.15s, color 0.15s, border-color 0.15s;
		white-space: nowrap;
		border: 1px solid transparent;
	}

	.btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	/* ── Primary ── */
	.btn-primary {
		background: var(--ink);
		color: var(--cream);
		border-color: var(--ink);
	}

	.btn-primary:hover:not(:disabled) {
		background: #3a3530;
		border-color: #3a3530;
	}

	/* ── Outline ── */
	.btn-outline {
		background: transparent;
		color: var(--ink);
		border-color: var(--ink);
	}

	.btn-outline:hover:not(:disabled) {
		background: var(--ink);
		color: var(--cream);
	}

	/* ── Full width ── */
	.full-width {
		width: 100%;
	}

	/* ── Arrow icon animation ── */
	.btn :global(svg) {
		transition: transform 0.2s;
		flex-shrink: 0;
	}

	.btn:hover:not(:disabled) :global(svg) {
		transform: translateX(3px);
	}
</style>