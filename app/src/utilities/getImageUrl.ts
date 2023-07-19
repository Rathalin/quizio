export function getBackendImageUrl(imageUrl: string | null | undefined) {
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}${imageUrl}`;
}
