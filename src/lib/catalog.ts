import christmasOrnamentThumbnail from '$lib/assets/thumbnails/example-item.jpg';
import bunnyLightCatcherThumbnail from '$lib/assets/thumbnails/example-item.jpg';
import catLightCatcherThumbnail from '$lib/assets/thumbnails/example-item.jpg';
import dogLightCatcherThumbnail from '$lib/assets/thumbnails/example-item.jpg';
import appleLightCatcherThumbnail from '$lib/assets/thumbnails/example-item.jpg';
import starLightCatcherThumbnail from '$lib/assets/thumbnails/example-item.jpg';
import tealightHolderThumbnail from '$lib/assets/thumbnails/example-item.jpg';
import mapleLeafThumbnail from '$lib/assets/thumbnails/example-item.jpg';
import heartLightCatcherThumbnail from '$lib/assets/thumbnails/example-item.jpg';


export type CatalogItem = {
	slug: string;
	name: string;
	description: string;
	thumbnail: string;
	minPhotos: number;
	maxPhotos: number;
};

export const catalog: CatalogItem[] = [
	{
		slug: 'X2YZXA5X',
		name: 'Christmas Ornament',
		description:
			'A magnificent bulb ornament to showcase your most cherished memories. Contains up to 4 portrait photos, brought to life by a replaceable light insert or your existing Christmas light strands (when compatible).',
		thumbnail: christmasOrnamentThumbnail,
		minPhotos: 1,
		maxPhotos: 4
	},
  {
		slug: 'BNY4HP2R',
		name: 'Bunny Light Catcher',
		description:
			'A cute bunny-shaped window hanger and light catcher to hang in your window and commemorate your beloved family friends.',
		thumbnail: bunnyLightCatcherThumbnail,
		minPhotos: 1,
		maxPhotos: 1
	},
  {
		slug: 'CAT8MF2N',
		name: 'Cat Light Catcher',
		description:
			'Furbaby havers be warned — this cat-shaped window hanger and light catcher is a favourite, and perfect for your cute kitties!',
		thumbnail: catLightCatcherThumbnail,
		minPhotos: 1,
		maxPhotos: 1
	},
  {
		slug: 'DOG7KW3M',
		name: 'Dog Light Catcher',
		description:
			"Put 'yer doggo in this cute window hanger and light catcher and wake up to your favourite pupper every sunrise!",
		thumbnail: dogLightCatcherThumbnail,
		minPhotos: 1,
		maxPhotos: 1
	},
	{
		slug: 'APL6NK2M',
		name: 'Apple Light Catcher',
		description:
			'Looking for a gift for a teacher? This apple-shaped window hanger and light catcher is perfect for the best and brightest raising our youth!',
		thumbnail: appleLightCatcherThumbnail,
		minPhotos: 1,
		maxPhotos: 1
	},
  {
		slug: 'STR9WM4X',
		name: 'Star Light Catcher',
		description:
			"For the little rockstars in the world, this star-shaped window hanger and light catcher is great for capturing some of life's brightest moments.",
		thumbnail: starLightCatcherThumbnail,
		minPhotos: 1,
		maxPhotos: 1
	},
	{
		slug: 'MVB0MZI8',
		name: 'Simple Tealight Holder',
		description:
			'Showcase your favourite memories in this mesmerizing and romantic centerpiece — a tealight to shine a little light on your memories.',
		thumbnail: tealightHolderThumbnail,
		minPhotos: 1,
		maxPhotos: 4
	},
	{
		slug: 'KPL8MF2N',
		name: 'Maple Leaf Light Catcher',
		description:
			'Patriots of Canada unite! This maple-shaped window hanger and light catcher is a great homage — be it sports, hiking, or your love for maple syrup.',
		thumbnail: mapleLeafThumbnail,
		minPhotos: 1,
		maxPhotos: 1
	},
	{
		slug: 'JKW2F91V',
		name: 'Heart Light Catcher',
		description:
			'Love is in the air — hang snapshots of your loved ones in this heart-shaped window hanger and light catcher, so that every sunset can be a special moment.',
		thumbnail: heartLightCatcherThumbnail,
		minPhotos: 1,
		maxPhotos: 1
	}
];

export function getItem(slug: string): CatalogItem | undefined {
	return catalog.find((item) => item.slug === slug);
}