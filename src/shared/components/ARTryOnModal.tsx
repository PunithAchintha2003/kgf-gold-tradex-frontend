import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Slider } from '../../components/ui/slider';
import { Camera, RotateCcw, Share2, X, Zap, Smartphone } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Product } from '../../types';

interface ARTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ARTryOnModal: React.FC<ARTryOnModalProps> = ({ isOpen, onClose, product }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState([100]);
  const [rotation, setRotation] = useState([0]);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate AR loading
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen]);

  if (!product) return null;

  const handleReset = () => {
    setScale([100]);
    setRotation([0]);
    setPosition({ x: 50, y: 50 });
  };

  const handleCapture = () => {
    // Simulate photo capture
    alert('Photo captured! In a real app, this would save the AR try-on image.');
  };

  const handleShare = () => {
    // Simulate sharing
    alert('Sharing AR try-on! In a real app, this would open share options.');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <span>AR Try-On: {product.name}</span>
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Use your camera to see how this jewelry looks on you
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* AR Viewer */}
          <div className="flex-1 relative bg-black">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-lg mb-2">Initializing AR Camera...</p>
                  <p className="text-sm opacity-75">Please allow camera access when prompted</p>
                </div>
              </div>
            ) : (
              <>
                {/* Simulated Camera Feed */}
                <div className="absolute inset-0">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=face"
                    alt="Camera feed"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* AR Overlay */}
                  <div 
                    className="absolute w-24 h-24 transition-all duration-300 ease-out"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      transform: `translate(-50%, -50%) scale(${(scale[0] ?? 100) / 100}) rotate(${rotation[0] ?? 0}deg)`,
                    }}
                  >
                    {product.images[0] && (
                      <ImageWithFallback
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-contain opacity-80 drop-shadow-lg"
                      />
                    )}
                  </div>
                  
                  {/* AR Guidelines */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-48 h-48 border-2 border-primary/50 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* AR Controls Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="bg-black/50 backdrop-blur rounded-lg p-3 text-white">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm">AR Active</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="bg-black/50 backdrop-blur text-white border-white/20"
                      onClick={handleCapture}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="bg-black/50 backdrop-blur text-white border-white/20"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Controls Panel */}
          <div className="w-80 bg-card border-l p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Product Info */}
              <div>
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <div className="flex items-center space-x-2 mb-3">
                  <Badge className="kgf-gradient text-white">
                    {product.karat}K
                  </Badge>
                  <Badge variant="outline">
                    {product.weight}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-primary">
                  LKR {product.price.toLocaleString()}
                </p>
              </div>

              {/* AR Instructions */}
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Zap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      AR Try-On Tips
                    </p>
                    <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Ensure good lighting</li>
                      <li>• Keep your face in the circle</li>
                      <li>• Use controls to adjust fit</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Adjustment Controls */}
              <div className="space-y-4">
                <h4 className="font-medium">Adjust Appearance</h4>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Size: {scale[0]}%
                  </label>
                  <Slider
                    value={scale}
                    onValueChange={setScale}
                    max={150}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Rotation: {rotation[0]}°
                  </label>
                  <Slider
                    value={rotation}
                    onValueChange={setRotation}
                    max={180}
                    min={-180}
                    step={5}
                    className="w-full"
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Position
                </Button>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button className="w-full kgf-gradient text-white">
                  Add to Cart
                </Button>
                <Button variant="outline" className="w-full">
                  View Product Details
                </Button>
              </div>

              {/* Features */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">AR Features</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Real-time face tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Accurate size estimation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Photo capture & share</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};