export function getImageUrl(imageUrl: string): string {
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}${imageUrl}`;
}

export function getImageName(imageUrl: string): string {
  return imageUrl.split('/').at(-1) ?? '';
}
