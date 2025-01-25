export function prefixWithBackendUrl(url: string): string {
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`;
}

export function getImageName(imageUrl: string): string {
  return imageUrl.split('/').at(-1) ?? '';
}
