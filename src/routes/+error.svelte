<script lang="ts">
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>Error {$page.status}</title>
</svelte:head>

<main>
  <div class="box">
    <h1>{$page.status}</h1>
    <p>{$page.error?.message ?? 'Something went wrong.'}</p>
    <a href="/">Go home →</a>
  </div>
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    padding: 1rem;
  }

  .box {
    width: 100%;
    max-width: 400px;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 2rem;
    text-align: center;
  }

  h1 {
    font-size: 3rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: #555;
    margin-bottom: 2rem;
  }

  a {
    color: #111;
    font-weight: 600;
  }
</style>