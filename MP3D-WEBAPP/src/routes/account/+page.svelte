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

  function getDownloadUrl(order: typeof data.orders[0]): string | null {
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
        return `Available until ${expiry.toLocaleDateString('en-CA', {
        month: 'long',
        day: 'numeric'
        })}`;
    }
</script>

<svelte:head>
  <title>My Account</title>
</svelte:head>

<main>
  <div class="header">
    <h1>My Account</h1>
    <button onclick={() => signOut({ callbackUrl: '/' })}>Sign out</button>
  </div>

  <p class="email">{data.user.email}</p>

  <!-- License status -->
  <section class="card">
    <h2>License</h2>

    {#if data.license}
      <div class="license-active">
        <span class="badge active">Active</span>
        <p class="since">Member since {formatDate(data.license.createdAt)}</p>
      </div>

      <div class="usage">
        <div class="usage-row">
          <span>Account standing</span>
          <span class="standing good">Good</span>
        </div>
        <div class="usage-row">
          <span>Fair use standing</span>
          {#if data.license.fairUseStatus === 'good'}
            <span class="standing good">Good</span>
          {:else if data.license.fairUseStatus === 'warning'}
            <span class="standing warning">Approaching limit</span>
          {:else}
            <span class="standing exceeded">Limit reached</span>
          {/if}
        </div>
        <p class="reset-note">Fair use resets on {resetDate}</p>
      </div>
    {:else}
      <div class="no-license">
        <span class="badge inactive">No license</span>
        <p>You don't have an active license.</p>
        <a href="/buy" class="btn">Get lifetime access →</a>
      </div>
    {/if}
  </section>

  <!-- Order history -->
  <section class="card">
    <h2>Order History</h2>

    {#if data.orders.length === 0}
      <p class="empty">No orders yet. <a href="/catalog">Browse the catalog →</a></p>
    {:else}
      <div class="orders">
        {#each data.orders as order}
          <div class="order">
            <div class="order-info">
              <span class="order-item">{order.itemSlug}</span>
              <span class="order-date">{formatDate(order.createdAt)}</span>
            </div>

            <div class="order-meta">
              <span class="status {order.status}">{order.status}</span>
              <span class="delivery">{order.deliveryMethod}</span>
            </div>

            {#if order.status === 'complete'}
              {#if order.job && !order.job.filesDeleted && new Date(order.job.expiresAt) > new Date()}
                {@const url = getDownloadUrl(order)}
                {#if url}
                  <div class="order-download">
                    <a href={url} class="download-link" download>Download STL</a>
                    <span class="expiry">{formatExpiry(order.job.expiresAt)}</span>                  </div>
                {/if}
              {:else}
                <p class="expired">File expired</p>
              {/if}
            {:else if order.status === 'processing' || order.status === 'pending'}
              <a href="/order/{order.id}" class="view-link">View status →</a>
            {:else if order.status === 'failed'}
              <a href="/catalog/{order.itemSlug}" class="retry-link">Retry →</a>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </section>
</main>

<style>
  main {
    max-width: 700px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
  }

  .header button {
    background: none;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.4rem 1rem;
    cursor: pointer;
    font-size: 0.9rem;
    color: #555;
  }

  .header button:hover {
    background: #f5f5f5;
  }

  .email {
    color: #888;
    font-size: 0.9rem;
    margin-bottom: 2rem;
  }

  .card {
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .card h2 {
    margin: 0 0 1.25rem;
    font-size: 1.1rem;
  }

  .badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .badge.active {
    background: #e6f4ea;
    color: #060;
  }

  .badge.inactive {
    background: #fee;
    color: #c00;
  }

  .since {
    color: #888;
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }

  .usage {
    margin-top: 1.25rem;
  }

  .reset-note {
    font-size: 0.8rem;
    color: #888;
    margin-top: 0.5rem;
  }

  .no-license p {
    color: #555;
    margin: 0.5rem 0 1rem;
    font-size: 0.9rem;
  }

  .btn {
    display: inline-block;
    padding: 0.6rem 1.25rem;
    background: #111;
    color: #fff;
    border-radius: 6px;
    text-decoration: none;
    font-size: 0.9rem;
  }

  .empty {
    color: #888;
    font-size: 0.9rem;
  }

  .orders {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .order {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 1rem;
  }

  .order-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .order-item {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .order-date {
    color: #888;
    font-size: 0.85rem;
  }

  .order-meta {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .status {
    font-size: 0.8rem;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
  }

  .status.complete { background: #e6f4ea; color: #060; }
  .status.pending { background: #fff8e1; color: #b45309; }
  .status.processing { background: #e8f0fe; color: #1a56db; }
  .status.failed { background: #fee; color: #c00; }

  .delivery {
    font-size: 0.8rem;
    color: #888;
  }

  .order-download {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .download-link {
    font-size: 0.85rem;
    color: #111;
    font-weight: 600;
  }

  .expiry {
    font-size: 0.8rem;
    color: #888;
  }

  .expired {
    font-size: 0.85rem;
    color: #888;
    margin-top: 0.5rem;
  }

  .view-link, .retry-link {
    font-size: 0.85rem;
    color: #111;
    margin-top: 0.5rem;
    display: inline-block;
  }

  a { color: #111; }

  .usage-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
  }

  .standing {
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
  }

  .standing.good { background: #e6f4ea; color: #060; }
  .standing.warning { background: #fff8e1; color: #b45309; }
  .standing.exceeded { background: #fee; color: #c00; }
</style>