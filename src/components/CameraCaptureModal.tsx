import React, { useState, useRef, useEffect } from 'react';
import { getCurrentPosition, reverseGeocode, formatCoordinates } from '../utils/geo';
import { CaptureMetadata } from '../types';
import { Camera, RefreshCw, Check, AlertCircle, MapPin, Upload, X, ShieldAlert } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen?: boolean;
  onClose: () => void;
  title?: string;
  onCaptureComplete?: (data: {
    imageUrl: string;
    latitude: number;
    longitude: number;
    address: string;
    metadata: CaptureMetadata;
  }) => void;
  onCapture?: (data: {
    imageUrl: string;
    latitude: number;
    longitude: number;
    address: string;
    metadata: CaptureMetadata;
  }) => void;
  // Optional preset coordinates for contractor demo testing
  initialCoords?: { lat: number; lon: number; address?: string };
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen = true,
  onClose,
  title = 'Live Camera & GPS Viewfinder',
  onCaptureComplete,
  onCapture,
  initialCoords,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoadingGps, setIsLoadingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [coords, setCoords] = useState<{ lat: number; lon: number; accuracy?: number } | null>(
    initialCoords ? { lat: initialCoords.lat, lon: initialCoords.lon, accuracy: 3.5 } : null
  );
  const [address, setAddress] = useState<string>(initialCoords?.address || '');
  const [isGeocoding, setIsGeocoding] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    // If we don't have coordinates yet, fetch GPS automatically
    if (!coords) {
      acquireGps();
    } else if (!address) {
      resolveAddress(coords.lat, coords.lon);
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' }, // Back camera preferred on phones
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      } else {
        setCameraError('Camera API not accessible in this environment. You can upload a photo instead.');
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access not granted or unavailable. You can upload a photo instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const acquireGps = async () => {
    setIsLoadingGps(true);
    setGpsError(null);
    try {
      const position = await getCurrentPosition();
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      setCoords({ lat, lon, accuracy });
      await resolveAddress(lat, lon);
    } catch (err: any) {
      setGpsError(err.message || 'GPS location acquisition failed.');
      // Fallback coordinates for demo if browser GPS denied
      const fallbackLat = 19.0596;
      const fallbackLon = 72.8295;
      setCoords({ lat: fallbackLat, lon: fallbackLon, accuracy: 10 });
      setAddress('Bandra West, Mumbai (Default Demo Location)');
    } finally {
      setIsLoadingGps(false);
    }
  };

  const resolveAddress = async (lat: number, lon: number) => {
    setIsGeocoding(true);
    try {
      const addr = await reverseGeocode(lat, lon);
      setAddress(addr);
    } catch {
      setAddress(`Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}`);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Capture frame from active video
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  // Handle manual file upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCapturedImage(result);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirmEvidence = () => {
    if (!capturedImage || !coords) return;

    const metadata: CaptureMetadata = {
      captureSource: stream ? 'device_camera' : 'file_upload',
      accuracyMeters: coords.accuracy || 4.0,
      deviceTimestamp: new Date().toISOString(),
      aspectRatio: '4:3',
      userAgent: navigator.userAgent,
    };

    const callback = onCaptureComplete || onCapture;
    if (callback) {
      callback({
        imageUrl: capturedImage,
        latitude: coords.lat,
        longitude: coords.lon,
        address: address || `Lat: ${coords.lat.toFixed(5)}, Lon: ${coords.lon.toFixed(5)}`,
        metadata,
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-sky-400" />
            <h3 className="font-semibold text-sm tracking-wide">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative bg-slate-950 aspect-4/3 flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured evidence"
              className="w-full h-full object-cover"
            />
          ) : cameraError ? (
            <div className="p-6 text-center text-slate-300 flex flex-col items-center">
              <ShieldAlert className="w-10 h-10 text-amber-400 mb-2" />
              <p className="text-xs max-w-xs">{cameraError}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Select Photo from Device
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Civic viewfinder reticle overlay */}
              <div className="absolute inset-8 border border-white/40 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-sky-400" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-sky-400" />
                </div>
                <div className="text-center text-[10px] text-white/80 bg-slate-900/60 px-2 py-0.5 rounded backdrop-blur-xs self-center">
                  Align pothole & background landmark inside frame
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-sky-400" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-sky-400" />
                </div>
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Live GPS & Metadata Bar */}
        <div className="bg-slate-50 border-t border-b border-slate-200 p-3.5 text-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <MapPin className="w-4 h-4 text-sky-700 shrink-0" />
                <span>GPS Location Evidence</span>
                {isLoadingGps && <RefreshCw className="w-3 h-3 text-sky-600 animate-spin" />}
              </div>

              {coords ? (
                <div className="mt-1">
                  <p className="font-mono text-[11px] text-slate-700">
                    {formatCoordinates(coords.lat, coords.lon)}
                    {coords.accuracy && (
                      <span className="text-slate-500 ml-1.5 font-sans">
                        (±{coords.accuracy.toFixed(1)}m precision)
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                    {isGeocoding ? 'Resolving street address...' : address}
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {gpsError || 'Acquiring GPS coordinates...'}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={acquireGps}
              disabled={isLoadingGps}
              className="text-[11px] text-sky-700 hover:text-sky-900 font-medium px-2 py-1 rounded bg-white border border-slate-200 shrink-0 flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingGps ? 'animate-spin' : ''}`} />
              Re-scan GPS
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-white flex items-center justify-between gap-3">
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retake Photo
              </button>
              <button
                type="button"
                onClick={handleConfirmEvidence}
                disabled={!coords}
                className="px-5 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 disabled:bg-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                Use This Evidence
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload File
              </button>
              <button
                type="button"
                onClick={captureFrame}
                disabled={!!cameraError}
                className="flex-1 max-w-xs py-2.5 px-6 bg-sky-700 hover:bg-sky-800 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Capture Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
