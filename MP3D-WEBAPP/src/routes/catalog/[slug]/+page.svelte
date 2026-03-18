<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let files: FileList | null = $state(null);
  let deliveryMethod: 'download' | 'email' = $state('download');
  let submitting = $state(false);
  let error = $state('');

  const fileArray = $derived(files ? Array.from(files) : []);
  const fileCount = $derived(fileArray.length);
  const tooFew = $derived(fileCount > 0 && fileCount < data.item.minPhotos);
  const tooMany = $derived(fileCount > data.item.maxPhotos);
  const valid = $derived(
    fileCount >= data.item.minPhotos && fileCount <= data.item.maxPhotos
  );

  async function handleSubmit() {
    if (!valid || submitting) return;

    submitting = true;
    error = '';

    const formData = new FormData();
    formData.append('slug', data.item.slug);
    formData.append('deliveryMethod', deliveryMethod);
    for (const file of fileArray) {
      formData.append('photos', file);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();

      if (!res.ok) {
        error = json.message ?? 'Upload failed';
        submitting = false;
        return;
      }

      window.location.href = `/order/${json.orderId}`;
    } catch (e) {
      error = 'Network error, please try again.';
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>{data.item.name}</title>
</svelte:head>

<main>
  <a href="/catalog">← Back to catalog</a>

  <div class="item-header">
    <img src={data.item.thumbnail} alt={data.item.name} />
    <div>
      <h1>{data.item.name}</h1>
      <p>{data.item.description}</p>
      <p class="usage">
        Monthly usage: {data.license.monthlyUsage} generations used
      </p>
    </div>
  </div>

  <section class="upload-section">
    <h2>Upload Photos</h2>
    <p>Upload between {data.item.minPhotos} and {data.item.maxPhotos} photos (JPEG or PNG).</p>

    <div class="field">
      <label for="photos">Select photos</label>
      <input
        id="photos"
        type="file"
        accept="image/jpeg,image/png,image/heic,.heic"
        multiple
        onchange={(e) => {
          const target = e.target as HTMLInputElement;
          files = target.files;
        }}
      />
    </div>

    {#if tooFew}
      <p class="error">Please select at least {data.item.minPhotos} photos.</p>
    {/if}

    {#if tooMany}
      <p class="error">Maximum {data.item.maxPhotos} photos allowed.</p>
    {/if}

    {#if fileCount > 0 && valid}
      <p class="success">{fileCount} photo{fileCount > 1 ? 's' : ''} selected.</p>
    {/if}

    <div class="field">
      <label>Delivery method</label>
      <div class="radio-group">
        <label>
          <input type="radio" bind:group={deliveryMethod} value="download" />
          Download link
        </label>
        <label>
          <input type="radio" bind:group={deliveryMethod} value="email" />
          Email to {data.license ? 'your address' : 'you'}
        </label>
      </div>
    </div>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <button disabled={!valid || submitting} onclick={handleSubmit}>
      {submitting ? 'Uploading...' : 'Generate STL'}
    </button>
  </section>
</main>

<style>
  main {
    max-width: 700px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  .item-header {
    display: flex;
    gap: 1.5rem;
    margin: 1.5rem 0;
    align-items: flex-start;
  }

  .item-header img {
    width: 180px;
    border-radius: 8px;
    object-fit: cover;
  }

  .usage {
    font-size: 0.85rem;
    color: #888;
  }

  .upload-section {
    margin-top: 2rem;
  }

  .field {
    margin: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .radio-group {
    display: flex;
    gap: 1.5rem;
  }

  .error {
    color: #c00;
    font-size: 0.9rem;
  }

  .success {
    color: #060;
    font-size: 0.9rem;
  }

  button {
    margin-top: 1rem;
    padding: 0.75rem 2rem;
    background: #111;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>