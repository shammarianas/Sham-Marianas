import { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const useImageSizeConverter = () => {
  const [converting, setConverting] = useState(false);

  const resizeImage = (file, maxWidth, maxHeight, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with specified quality
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const generateAllSizes = async (originalFile) => {
    if (!originalFile) return null;

    setConverting(true);
    try {
      const sizes = [
        { name: 'small', width: 1000, height: 667 },
        { name: 'medium', width: 1500, height: 1000 },
        { name: 'large', width: 2000, height: 1334 },
        { name: 'original', width: 5354, height: 3570 }
      ];

      const imageFiles = {};

      for (const size of sizes) {
        let processedFile;
        
        if (size.name === 'original') {
          // Keep original file as is
          processedFile = originalFile;
        } else {
          // Resize for other sizes
          processedFile = await resizeImage(originalFile, size.width, size.height);
        }

        imageFiles[size.name] = processedFile;
      }

      return imageFiles;
    } catch (error) {
      console.error('Error generating image sizes:', error);
      return null;
    } finally {
      setConverting(false);
    }
  };

  const uploadAllSizes = async (imageFiles, folderPath) => {
    const storage = getStorage();
    const uploadPromises = [];
    const downloadURLs = {};

    try {
      for (const [sizeName, file] of Object.entries(imageFiles)) {
        const fileName = `${sizeName}_${Date.now()}.jpg`;
        const storageRef = ref(storage, `${folderPath}/${fileName}`);
        
        uploadPromises.push(
          uploadBytes(storageRef, file).then((snapshot) =>
            getDownloadURL(snapshot.ref).then((url) => {
              downloadURLs[sizeName] = {
                url,
                size: file.size,
                dimensions: getDimensionsForSize(sizeName)
              };
            })
          )
        );
      }

      await Promise.all(uploadPromises);
      return downloadURLs;
    } catch (error) {
      console.error('Error uploading image sizes:', error);
      return null;
    }
  };

  const getDimensionsForSize = (sizeName) => {
    switch (sizeName) {
      case 'small': return { width: 1000, height: 667 };
      case 'medium': return { width: 1500, height: 1000 };
      case 'large': return { width: 2000, height: 1334 };
      case 'original': return { width: 5354, height: 3570 };
      default: return { width: 0, height: 0 };
    }
  };

  return {
    converting,
    generateAllSizes,
    uploadAllSizes
  };
};

export default useImageSizeConverter;