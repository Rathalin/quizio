export async function timeout(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
