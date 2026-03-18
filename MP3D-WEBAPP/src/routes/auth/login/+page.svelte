<script lang="ts">
  import { signIn } from '@auth/sveltekit/client';
</script>

<svelte:head>
  <title>Sign In</title>
</svelte:head>

<main>
  <div class="box">
    <h1>Sign In</h1>
    <p>Sign in to access your license and generate STL files.</p>

    <div class="providers">
      <button onclick={() => signIn('google', { callbackUrl: '/catalog' })}>
        Continue with Google
      </button>
      <button onclick={() => signIn('github', { callbackUrl: '/catalog' })}>
        Continue with GitHub
      </button>
    </div>
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
    margin-bottom: 0.5rem;
  }

  p {
    color: #555;
    margin-bottom: 2rem;
  }

  .providers {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  button {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: #fff;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  button:hover {
    background: #f5f5f5;
  }
</style>