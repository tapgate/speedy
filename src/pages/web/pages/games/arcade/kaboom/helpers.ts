export const mergeImg = (urls: any) => {
  const promises: any[] = [];
  for (const url of urls) {
    const img = new Image();
    img.src = url;
    img.crossOrigin = 'anonymous';
    promises.push(
      new Promise((resolve, reject) => {
        img.onload = () => {
          resolve(img);
        };
        img.onerror = () => {
          reject(`failed to load ${url}`);
        };
      })
    );
  }
  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then((images) => {
        const canvas = document.createElement('canvas');

        const width = images[0].width;
        const height = images[0].height;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          images.forEach((img, i) => {
            if (img.width === width && img.height === height) {
              ctx.drawImage(img, 0, 0);
            }
          });
          resolve(ctx.getImageData(0, 0, width, height));
        } else {
          reject();
        }
      })
      .catch((error) => reject(error));
  });
};
