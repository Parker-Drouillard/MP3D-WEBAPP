<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  // These intentionally capture initial values — updates come via SSE
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

  const itemSlug = $derived(data.order.itemSlug);
  const deliveryMethod = $derived(data.order.deliveryMethod);
  const orderId = $derived(data.order.id);


  function connectSSE() {
    if (status === 'complete' || status === 'failed') return;

    eventSource = new EventSource(`/api/order-status/${orderId}`);

    eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      status = payload.status;
      jobStatus = payload.jobStatus;

      if (payload.downloadToken) downloadToken = payload.downloadToken;
      if (payload.jobId) jobId = payload.jobId;
      if (payload.expiresAt) {
        expiresAt = new Date(payload.expiresAt);
      }

      if (status === 'complete' || status === 'failed') {
        eventSource?.close();
      }
    };

    eventSource.onerror = () => {
      eventSource?.close();
      setTimeout(connectSSE, 5000);
    };
  }

  onMount(() => {
      connectSSE();
  });

  onDestroy(() => {
    eventSource?.close();
  });

  const downloadUrl = $derived(
    jobId && downloadToken
      ? `/api/download/${jobId}?token=${downloadToken}`
      : null
  );
</script>

<svelte:head>
  <title>Order Status</title>
</svelte:head>

<main>
  <a href="/catalog">← Back to catalog</a>

  <div class="card">
    <h1>Order Status</h1>
    <p class="item">Item: <strong>{itemSlug}</strong></p>
    <p class="delivery">
      Delivery: <strong>{deliveryMethod === 'email' ? 'Email' : 'Download'}</strong>
    </p>

    <div class="status-section">
      {#if status === 'pending' || status === 'processing'}
        <div class="spinner"></div>
        <p class="status-text">
          {status === 'pending' ? 'Your order is queued...' : 'Generating your STL file...'}
        </p>
        <p class="status-sub">This may take a few minutes. This page will update automatically.</p>

      {:else if status === 'complete'}
        <div class="success-icon">✓</div>
        <p class="status-text">Your STL file is ready!</p>

        {#if data.order.deliveryMethod === 'email'}
          <p class="status-sub">
            A download link has been sent to your email address.
            You can also download directly below.
          </p>
        {/if}

        {#if downloadUrl}
          <a href={downloadUrl} class="download-btn" download>
            Download STL File
          </a>
        {/if}

        {#if expiresAt}
          <p class="expiry">
            Available until {expiresAt.toLocaleDateString('en-CA', {
              month: 'long',
              day: 'numeric'
            })}
          </p>
        {/if}

      {:else if status === 'failed'}
        <div class="error-icon">✗</div>
        <p class="status-text">Generation failed</p>
        <p class="status-sub">
          Something went wrong generating your STL file. Please try again or contact support.
        </p>
        <a href="/catalog/{data.order.itemSlug}" class="btn">Try again</a>
      {/if}
    </div>
  </div>
</main>

<style>
  main {
    max-width: 600px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  .card {
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 2rem;
    margin-top: 1.5rem;
    text-align: center;
  }

  h1 {
    margin-bottom: 0.5rem;
  }

  .item, .delivery {
    color: #555;
    font-size: 0.9rem;
    margin: 0.25rem 0;
  }

  .status-section {
    margin-top: 2rem;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #eee;
    border-top-color: #111;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .success-icon {
    font-size: 3rem;
    color: #060;
    margin-bottom: 1rem;
  }

  .error-icon {
    font-size: 3rem;
    color: #c00;
    margin-bottom: 1rem;
  }

  .status-text {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .status-sub {
    color: #555;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  .download-btn {
    display: inline-block;
    padding: 0.75rem 2rem;
    background: #111;
    color: #fff;
    border-radius: 6px;
    text-decoration: none;
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .expiry {
    font-size: 0.85rem;
    color: #888;
    margin-top: 0.5rem;
  }

  .btn {
    display: inline-block;
    padding: 0.75rem 2rem;
    border: 1px solid #111;
    border-radius: 6px;
    text-decoration: none;
    color: #111;
    font-size: 1rem;
  }

  a {
    color: #111;
  }
</style>