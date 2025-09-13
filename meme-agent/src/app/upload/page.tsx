'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
// @ts-ignore - gif.js doesn't have proper TypeScript definitions
import GIF from 'gif.js';

// Caption option type
type CaptionOption = {
  style: string;
  top: string;
  bottom: string;
  alt_text: string;
};

// Stats type
type Stats = {
  shares: number;
};

export default function UploadPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [captions, setCaptions] = useState<CaptionOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({ shares: 0 });
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  const [generatedGifs, setGeneratedGifs] = useState<Record<number, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch stats every 3 seconds
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    fetchStats(); // Initial fetch
    
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);
  
  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleImageUpload(file);
    }
  };
  
  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleImageUpload(file);
    }
  };
  
  // Handle image upload
  const handleImageUpload = async (file: File) => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Check file size (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      setError('Image must be less than 5MB');
      return;
    }
    
    // Clear previous state
    setError(null);
    setCaptions([]);
    setGeneratedGifs({});
    
    // Set uploaded image
    setUploadedImage(file);
    
    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Analyze image
    await analyzeImage(file);
  };
  
  // Analyze image and get captions
  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      
      // Call analyze API
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }
      
      const analyzeData = await analyzeResponse.json();
      
      // Call caption API with analyze results
      const captionResponse = await fetch('/api/caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tags: analyzeData.tags,
          memeCandidates: analyzeData.memeCandidates,
        }),
      });
      
      if (!captionResponse.ok) {
        const errorData = await captionResponse.json();
        throw new Error(errorData.error || 'Failed to generate captions');
      }
      
      const captionData = await captionResponse.json();
      setCaptions(captionData.options);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Generate GIF for a caption
  const generateGif = async (caption: CaptionOption, index: number) => {
    if (!uploadedImage || !imagePreview) return;
    
    setIsGeneratingGif(true);
    
    try {
      // Create a new image element from the uploaded image
      const img = new Image();
      img.src = imagePreview;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      // Create a canvas for rendering frames
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      // Set canvas dimensions
      const width = img.width;
      const height = img.height;
      canvas.width = width;
      canvas.height = height;
      
      // Create GIF encoder
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width,
        height,
        workerScript: '/gif.worker.js'
      });
      
      // Generate 8 frames
      const totalFrames = 8;
      
      for (let frame = 0; frame < totalFrames; frame++) {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Calculate zoom factor (Ken Burns effect)
        const zoomFactor = 1 + (frame / totalFrames) * 0.1;
        const scaledWidth = width * zoomFactor;
        const scaledHeight = height * zoomFactor;
        const offsetX = (width - scaledWidth) / 2;
        const offsetY = (height - scaledHeight) / 2;
        
        // Draw background image with zoom effect
        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
        
        // Set text style
        ctx.font = '36px ImpactLocal, Impact, sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 5;
        
        // Calculate top text with typing effect
        const topText = caption.top;
        const topTextProgress = Math.min(1, (frame + 1) / (totalFrames * 0.7));
        const visibleTopText = topText.substring(0, Math.floor(topText.length * topTextProgress));
        
        // Calculate bottom text with shake effect
        const bottomText = caption.bottom;
        const shakeAmount = frame % 2 === 0 ? 2 : -2;
        
        // Draw top text (typing effect)
        const topY = 50;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';
        ctx.strokeText(visibleTopText, width / 2, topY);
        ctx.fillText(visibleTopText, width / 2, topY);
        
        // Draw bottom text (shake effect)
        const bottomY = height - 30;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';
        ctx.strokeText(bottomText, width / 2 + shakeAmount, bottomY);
        ctx.fillText(bottomText, width / 2 + shakeAmount, bottomY);
        
        // Add frame to GIF
        gif.addFrame(canvas, { copy: true, delay: 200 });
      }
      
      // Render GIF
      gif.on('finished', (blob) => {
        const url = URL.createObjectURL(blob);
        setGeneratedGifs((prev) => ({ ...prev, [index]: url }));
        setIsGeneratingGif(false);
      });
      
      gif.render();
    } catch (error) {
      console.error('Error generating GIF:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate GIF');
      setIsGeneratingGif(false);
    }
  };
  
  // Download GIF
  const downloadGif = (index: number) => {
    const gifUrl = generatedGifs[index];
    if (!gifUrl) return;
    
    const a = document.createElement('a');
    a.href = gifUrl;
    a.download = `meme-${index}.gif`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Share GIF to Discord
  const shareToDiscord = async (index: number) => {
    const gifUrl = generatedGifs[index];
    if (!gifUrl) return;
    
    try {
      // Fetch the GIF as a blob
      const response = await fetch(gifUrl);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('gif', blob, 'meme.gif');
      
      // Call share API
      const shareResponse = await fetch('/api/share', {
        method: 'POST',
        body: formData,
      });
      
      if (!shareResponse.ok) {
        const errorData = await shareResponse.json();
        throw new Error(errorData.error || 'Failed to share to Discord');
      }
      
      const shareData = await shareResponse.json();
      setStats({ shares: shareData.shares });
      
      alert('Shared to Discord successfully!');
    } catch (error) {
      console.error('Error sharing to Discord:', error);
      setError(error instanceof Error ? error.message : 'Failed to share to Discord');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Zero-Click Meme Agent</h1>
        <div className="bg-red-500 text-white px-3 py-1 rounded-full flex items-center">
          🔥 {stats.shares}
        </div>
      </header>
      
      <div className="mb-8">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {!uploadedImage ? (
            <div>
              <p className="mb-4">Drag & drop an image here, or</p>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => fileInputRef.current?.click()}
              >
                Select Image
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileInputChange}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {imagePreview && (
                <div className="mb-4 max-w-md">
                  <img
                    src={imagePreview}
                    alt="Uploaded image"
                    className="max-w-full h-auto rounded"
                  />
                </div>
              )}
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                onClick={() => {
                  setUploadedImage(null);
                  setImagePreview(null);
                  setCaptions([]);
                  setGeneratedGifs({});
                }}
              >
                Remove Image
              </button>
            </div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
            {error}
          </div>
        )}
      </div>
      
      {isAnalyzing ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p>Analyzing image and generating captions...</p>
        </div>
      ) : (
        <div>
          {captions.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Caption Suggestions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {captions.map((caption, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden shadow-md">
                    <div className="p-4 bg-gray-100">
                      <div className="relative aspect-video bg-black flex flex-col justify-between items-center p-4">
                        {generatedGifs[index] ? (
                          <img
                            src={generatedGifs[index]}
                            alt={caption.alt_text}
                            className="max-w-full max-h-full"
                          />
                        ) : (
                          <>
                            {imagePreview && (
                              <img
                                src={imagePreview}
                                alt="Background"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            )}
                            <div className="relative z-10 text-center w-full">
                              <p className="font-['ImpactLocal'] text-white text-xl leading-tight text-stroke">
                                {caption.top}
                              </p>
                            </div>
                            <div className="relative z-10 text-center w-full mt-auto">
                              <p className="font-['ImpactLocal'] text-white text-xl leading-tight text-stroke">
                                {caption.bottom}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {!generatedGifs[index] ? (
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex-1"
                            onClick={() => generateGif(caption, index)}
                            disabled={isGeneratingGif}
                          >
                            {isGeneratingGif ? 'Generating...' : 'Make GIF'}
                          </button>
                        ) : (
                          <>
                            <button
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex-1"
                              onClick={() => downloadGif(index)}
                            >
                              Download GIF
                            </button>
                            <button
                              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm flex-1"
                              onClick={() => shareToDiscord(index)}
                            >
                              Share to Discord
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}