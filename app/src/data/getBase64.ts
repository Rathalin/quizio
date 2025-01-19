export function getBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    // Define the onload callback
    reader.onload = () => {
      resolve(
        (reader.result as string).replace(/^data:image\/\w+;base64,/, '')
      ); // reader.result contains the base64 string
    };

    // Define the onerror callback
    reader.onerror = (error) => {
      reject(error);
    };

    // Read the file as a Data URL (base64 encoded string)
    reader.readAsDataURL(file);
  });
}
