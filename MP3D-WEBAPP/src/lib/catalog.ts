import exampleThumbnail from '$lib/assets/thumbnails/example-item.jpg';

export type CatalogItem = {
  slug: string;
  name: string;
  description: string;
  thumbnail: string;
  maxPhotos: number;
  minPhotos: number;
};

export const catalog: CatalogItem[] = [
  {
    slug: 'example-item',
    name: 'Example Item',
    description: 'A placeholder catalog item for development and testing.',
    thumbnail: exampleThumbnail,
    minPhotos: 2,
    maxPhotos: 5
  }
];

export function getItem(slug: string): CatalogItem | undefined {
  return catalog.find((item) => item.slug === slug);
}