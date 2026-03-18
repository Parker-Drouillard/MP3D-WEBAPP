<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Catalog</title>
</svelte:head>

<main>
  <h1>Choose an Item</h1>
  <div class="grid">
    {#each data.items as item}
      <a href="/catalog/{item.slug}" class="card">
        <img src={item.thumbnail} alt={item.name} />
        <div class="info">
          <h2>{item.name}</h2>
          <p>{item.description}</p>
          <span class="meta">{item.minPhotos}–{item.maxPhotos} photos required</span>
        </div>
      </a>
    {/each}
  </div>
</main>

<style>
  main {
    max-width: 900px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  h1 {
    margin-bottom: 1.5rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.5rem;
  }

  .card {
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition: box-shadow 0.2s;
  }

  .card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .card img {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
  }

  .info {
    padding: 1rem;
  }

  .info h2 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
  }

  .info p {
    margin: 0 0 0.5rem;
    font-size: 0.9rem;
    color: #555;
  }

  .meta {
    font-size: 0.8rem;
    color: #888;
  }
</style>