<script lang="ts">
  import { onMount } from 'svelte';
  import { PUBLIC_SQUARE_APPLICATION_ID, PUBLIC_SQUARE_ENVIRONMENT } from '$env/static/public';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let card: any = $state(null);
  let payments: any = $state(null);
  let submitting = $state(false);
  let error = $state('');
  let sdkLoaded = $state(false);

  onMount(async () => {
    if (data.soldOut || data.hasLicense) return;

    // Dynamically load the Square Web Payments SDK
    const script = document.createElement('script');
    script.src = PUBLIC_SQUARE_ENVIRONMENT === 'sandbox'
      ? 'https://sandbox.web.squarecdn.com/v1/square.js'
      : 'https://web.squarecdn.com/v1/square.js';

    script.onload = async () => {
      try {
        // @ts-ignore
        payments = window.Square.payments(
          PUBLIC_SQUARE_APPLICATION_ID,
          data.locationId
        );
        card = await payments.card();
        await card.attach('#card-container');
        sdkLoaded = true;
      } catch (e) {
        error = 'Failed to load payment form. Please refresh and try again.';
      }
    };

    document.head.appendChild(script);
  });

  async function handlePayment() {
    if (!card || submitting) return;

    submitting = true;
    error = '';

    try {
      const result = await card.tokenize();

      if (result.status !== 'OK') {
        error = result.errors?.[0]?.message ?? 'Card tokenization failed';
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
        error = json.message ?? 'Payment failed';
        submitting = false;
        return;
      }

      window.location.href = '/catalog';
    } catch (e) {
      error = 'Payment failed. Please try again.';
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Get Lifetime Access</title>
</svelte:head>

<main>
  {#if data.hasLicense}
    <div class="box">
      <h1>You already have access</h1>
      <p>Your lifetime license is active.</p>
      <a href="/catalog">Go to catalog →</a>
    </div>

  {:else if data.soldOut}
    <div class="box">
      <h1>Sold Out</h1>
      <p>All 5,300 lifetime licenses have been claimed.</p>
    </div>

  {:else}
    <div class="box">
      <h1>Get Lifetime Access</h1>
      <p class="scarcity">{data.remaining} of 5,300 licenses remaining</p>

      <div class="price">$300 CAD</div>
      <p class="price-note">One-time payment. Unlimited STL generations.</p>

      {#if !data.isLoggedIn}
        <a href="/auth/login" class="btn">Sign in to purchase</a>
      {:else}
        <div id="card-container"></div>

        {#if !sdkLoaded && !error}
          <p class="loading">Loading payment form...</p>
        {/if}

        {#if error}
          <p class="error">{error}</p>
        {/if}

        {#if sdkLoaded}
          <button onclick={handlePayment} disabled={submitting}>
            {submitting ? 'Processing...' : 'Pay $300 CAD'}
          </button>
        {/if}
      {/if}
    </div>
  {/if}
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 70vh;
    padding: 1rem;
  }

  .box {
    width: 100%;
    max-width: 480px;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 2rem;
    text-align: center;
  }

  .scarcity {
    color: #c00;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }

  .price {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 1rem 0 0.25rem;
  }

  .price-note {
    color: #555;
    margin-bottom: 2rem;
  }

  #card-container {
    margin: 1.5rem 0;
    min-height: 90px;
  }

  .loading {
    color: #888;
    font-size: 0.9rem;
  }

  .error {
    color: #c00;
    font-size: 0.9rem;
    margin: 0.5rem 0;
  }

  button {
    width: 100%;
    padding: 0.85rem;
    background: #111;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 0.5rem;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn {
    display: inline-block;
    padding: 0.75rem 2rem;
    background: #111;
    color: #fff;
    border-radius: 6px;
    text-decoration: none;
    margin-top: 1rem;
  }

  a {
    color: #111;
  }
</style>