import React, { useState, useCallback, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import Modal from './Modal';
import { ICONS } from './constants';

interface CropSuggestion {
    x: number;
    y: number;
    width: number;
    height: number;
    description: string;
    previewUrl?: string;
}

const getCroppedImg = (imageSrc: string, pixelCrop: Area, rotation = 0): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('Failed to get canvas context'));
      }

      const safeArea = Math.max(image.width, image.height) * 2;
      canvas.width = safeArea;
      canvas.height = safeArea;
      
      ctx.translate(safeArea / 2, safeArea / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-image.width / 2, -image.height / 2);
      ctx.drawImage(image, 0, 0);

      const data = ctx.getImageData(0, 0, safeArea, safeArea);

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      
      ctx.putImageData(
        data,
        Math.round(0 - safeArea / 2 + image.width / 2 - pixelCrop.x),
        Math.round(0 - safeArea / 2 + image.height / 2 - pixelCrop.y)
      );

      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = (error) => reject(error);
  });
};

const Slider: React.FC<{
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
}> = ({ value, min, max, step, onChange, icon }) => (
    <div className="flex items-center space-x-3 bg-slate-700/50 p-2 rounded-lg">
        <span className="text-slate-400">{icon}</span>
        <input
            type="range"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer range-slider"
        />
    </div>
);


interface ImageCropperModalProps {
  imageSrc: string | null;
  onSave: (croppedImage: string) => void;
  onClose: () => void;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ imageSrc, onSave, onClose }) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<CropSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [initialCropPixels, setInitialCropPixels] = useState<Area | undefined>(undefined);
  const [cropperKey, setCropperKey] = useState(0);
  const imageDimensionsRef = useRef<{ width: number; height: number } | null>(null);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);
  
  const getSmartCropSuggestions = async (src: string) => {
    setIsLoadingSuggestions(true);
    setSuggestions([]);
    try {
        const response = await fetch('/api/smart-crop', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: src }),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        const result = await response.json();

        if (result && result.suggestions) {
            const img = new Image();
            img.onload = async () => {
                imageDimensionsRef.current = { width: img.width, height: img.height };
                const suggestionsWithPreviews = await Promise.all(result.suggestions.map(async (s: CropSuggestion) => {
                    const pxBox = { x: s.x * img.width, y: s.y * img.height, width: s.width * img.width, height: s.height * img.height };
                    const cropSize = Math.max(pxBox.width, pxBox.height);
                    const cropX = pxBox.x + (pxBox.width / 2) - (cropSize / 2);
                    const cropY = pxBox.y + (pxBox.height / 2) - (cropSize / 2);
                    const previewUrl = await getCroppedImg(src, { x: cropX, y: cropY, width: cropSize, height: cropSize });
                    return { ...s, previewUrl };
                }));
                setSuggestions(suggestionsWithPreviews);
            };
            img.src = src;
        }

    } catch (error) {
        console.error("Error getting smart crop suggestions:", error);
    } finally {
        setIsLoadingSuggestions(false);
    }
};

  useEffect(() => {
    if (imageSrc) {
        getSmartCropSuggestions(imageSrc);
        // Reset cropper state when a new image is loaded
        setZoom(1);
        setCrop({ x: 0, y: 0 });
        setRotation(0);
        setInitialCropPixels(undefined); // Clear initial crop to let user decide
        setCropperKey(k => k + 1); // Force re-mount of Cropper
    }
}, [imageSrc]);

const handleSuggestionClick = (suggestion: CropSuggestion) => {
    if (!imageDimensionsRef.current) return;
    const { width: imgWidth, height: imgHeight } = imageDimensionsRef.current;

    // Reset view state before applying suggestion
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setRotation(0);

    const pxBox = {
        x: suggestion.x * imgWidth,
        y: suggestion.y * imgHeight,
        width: suggestion.width * imgWidth,
        height: suggestion.height * imgHeight,
    };

    const cropSize = Math.max(pxBox.width, pxBox.height);
    const cropX = pxBox.x + (pxBox.width / 2) - (cropSize / 2);
    const cropY = pxBox.y + (pxBox.height / 2) - (cropSize / 2);
    
    // Set the initial crop area for the Cropper component
    setInitialCropPixels({
        x: cropX,
        y: cropY,
        width: cropSize,
        height: cropSize,
    });
    
    // Force re-initialization of the Cropper component with the new initial area
    setCropperKey(k => k + 1);
};


  const handleSave = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    setIsSaving(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onSave(croppedImage);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!imageSrc) return null;

  return (
    <Modal isOpen={!!imageSrc} onClose={onClose} title="Modifica Immagine Profilo" size="large" closeOnOverlayClick={false}>
      <div className="relative h-96 bg-black/50 rounded-lg overflow-hidden border border-slate-700 shadow-inner">
        {isLoadingSuggestions && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm overflow-hidden" aria-label="Analisi AI in corso">
                <div className="cosmic-ripples">
                    <div />
                    <div />
                    <div />
                </div>
                <p className="cosmic-ripples-text font-bold text-slate-100 tracking-wider text-lg" style={{textShadow: '0 0 15px rgba(56, 189, 248, 0.7)'}}>
                    Analisi AI in corso...
                </p>
            </div>
        )}
        <Cropper
          key={cropperKey}
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={1}
          initialCroppedAreaPixels={initialCropPixels}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
          cropShape="round"
          showGrid={false}
          style={{
            containerStyle: { 
                backgroundColor: '#0f172a',
                transition: 'filter 0.5s ease-out',
                filter: isLoadingSuggestions ? 'blur(4px) saturate(50%)' : 'none',
            },
            mediaStyle: { transition: 'all 0.3s ease' },
            cropAreaStyle: { border: '3px solid rgba(34, 211, 238, 0.7)', color: 'rgba(15, 23, 42, 0.7)' }
          }}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Slider value={zoom} min={1} max={3} step={0.05} onChange={setZoom} icon={ICONS.zoom_in} />
        <Slider value={rotation} min={0} max={360} step={1} onChange={setRotation} icon={ICONS.rotate_cw} />
      </div>
       { !isLoadingSuggestions && suggestions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-700/50 animate-fadeIn">
            <h4 className="text-base font-bold text-slate-200 mb-3 flex items-center space-x-2">
                {React.cloneElement(ICONS.magic_wand, {width: 20, height: 20, className: 'text-cyan-400'})}
                <span>Suggerimenti AI</span>
            </h4>
            <div className="flex space-x-3 overflow-x-auto pt-2 pb-2 -mx-6 px-6">
                {suggestions.map((suggestion, index) => (
                    <button key={index} onClick={() => handleSuggestionClick(suggestion)} className="flex-shrink-0 w-28 text-center group focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-lg p-1">
                        <img src={suggestion.previewUrl} alt={suggestion.description} className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-slate-600 group-hover:border-cyan-400 transition-colors duration-200" />
                        <p className="text-xs text-slate-300 mt-2 font-semibold truncate group-hover:text-cyan-300">{suggestion.description}</p>
                    </button>
                ))}
            </div>
        </div>
      )}
      <div className="flex justify-end space-x-3 pt-6 mt-2 border-t border-slate-700/50">
        <button onClick={onClose} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">
            Annulla
        </button>
        <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none disabled:cursor-wait transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-cyan-500/20 hover:shadow-xl"
        >
            {isSaving ? 'Salvataggio...' : 'Applica e Salva'}
        </button>
      </div>
      <style>{`
        .range-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #22d3ee;
            cursor: pointer;
            border: 3px solid #0f172a;
            box-shadow: 0 0 5px rgba(34, 211, 238, 0.5);
        }

        .range-slider::-moz-range-thumb {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #22d3ee;
            cursor: pointer;
            border: 3px solid #0f172a;
            box-shadow: 0 0 5px rgba(34, 211, 238, 0.5);
        }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }

        .cosmic-ripples {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 1px;
            height: 1px;
        }

        .cosmic-ripples div {
            position: absolute;
            top: 0;
            left: 0;
            border: 2px solid #22d3ee;
            border-radius: 50%;
            animation: cosmic-ripple-effect 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }

        .cosmic-ripples div:nth-child(2) {
            animation-delay: 0.5s;
        }

        .cosmic-ripples div:nth-child(3) {
            animation-delay: 1s;
        }

        @keyframes cosmic-ripple-effect {
            from {
                width: 0;
                height: 0;
                opacity: 0.8;
            }
            to {
                width: 300px;
                height: 300px;
                margin-left: -150px;
                margin-top: -150px;
                opacity: 0;
            }
        }
        
        @keyframes cosmic-text-glow {
            from { opacity: 0.5; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }

        .cosmic-ripples-text {
            position: relative;
            z-index: 10;
            animation: cosmic-text-glow 2s ease-in-out infinite alternate;
        }
      `}</style>
    </Modal>
  );
};

export default ImageCropperModal;
