export function getBackendImageUrl(imageUrl: string): string {
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}${imageUrl}`;
}
