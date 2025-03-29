"use client";

import { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { Button } from "@/components/ui/button";
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  imageFile: File;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageCropper({ imageFile, onCropComplete, onCancel }: ImageCropperProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
      });
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const cropAspect = 1; // Forcer un aspect ratio de 1:1 (carré)
    setCrop(centerAspectCrop(width, height, cropAspect));
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop) return;
    
    setIsLoading(true);
    
    try {
      // Créer un canvas pour le recadrage
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Impossible de créer le contexte canvas');
      }

      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;

      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      // Convertir le canvas en blob
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Échec de la création du blob');
        }
        
        // Créer un nouveau fichier à partir du blob
        const croppedFile = new File([blob], imageFile.name, {
          type: imageFile.type,
          lastModified: Date.now(),
        });
        
        onCropComplete(croppedFile);
        setIsLoading(false);
      }, imageFile.type || 'image/jpeg');
    } catch (error) {
      console.error('Erreur lors du recadrage:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      
      <div className="relative bg-zinc-900 rounded-xl p-6 w-full max-w-md mx-auto z-10 overflow-auto">
        <h2 className="text-xl font-semibold mb-4 text-white">Recadrer l&apos;image</h2>
        
        <div className="mb-4">
          <p className="text-sm text-zinc-400 mb-2">
            Faites glisser pour ajuster la zone de recadrage. L&apos;image sera recadrée en carré.
          </p>
          
          {imgSrc ? (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop: Crop) => setCrop(percentCrop)}
              onComplete={(c: PixelCrop) => setCompletedCrop(c)}
              aspect={1}
              circularCrop={false}
              className="max-h-[300px] mx-auto"
            >
              <img
                ref={imgRef}
                src={imgSrc}
                alt="Aperçu à recadrer"
                onLoad={onImageLoad}
                className="max-h-[300px] w-auto"
              />
            </ReactCrop>
          ) : (
            <div className="flex items-center justify-center h-[300px] bg-zinc-800 rounded-md">
              <p className="text-zinc-500">Chargement de l&apos;image...</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button 
            variant="ghost" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button 
            className="bg-violet-600 hover:bg-violet-700"
            onClick={handleCropComplete}
            disabled={!completedCrop || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                Traitement...
              </div>
            ) : (
              "Appliquer"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 