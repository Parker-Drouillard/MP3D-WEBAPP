<script lang="ts">
  import { page } from '$app/stores';

  const error = $derived($page.url.searchParams.get('error'));

  const messages: Record<string, string> = {
    OAuthSignin: 'Could not start the sign in process. Please try again.',
    OAuthCallback: 'Something went wrong during sign in. Please try again.',
    OAuthCreateAccount: 'Could not create your account. Please try again.',
    OAuthAccountNotLinked: 'This email is already associated with another sign in method.',
    InvalidCheck: 'Your sign in session expired. Please try again.',
    Default: 'An unexpected error occurred. Please try again.'
  };

  const message = $derived(
    error ? (messages[error] ?? messages.Default) : messages.Default
  );
</script>

<svelte:head>
  <title>Sign In Error</title>
</svelte:head>

<main>
  <div class="box">
    <h1>Sign In Failed</h1>
    <p>{message}</p>
    <a href="/auth/login">Try again →</a>
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

  a {
    color: #111;
    font-weight: 600;
  }
</style>