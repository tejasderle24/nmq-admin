import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";

const BANNER_WIDTH = 1200;
const BANNER_HEIGHT = 450;
const BANNER_ASPECT = BANNER_WIDTH / BANNER_HEIGHT;

export default function AdvertisementImageCropper({
  file,
  onCropComplete,
  onCancel,
}) {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useState(() => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImage(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleCropComplete = useCallback(
    (_, croppedPixels) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  const createCroppedImage = async () => {
    if (!image || !croppedAreaPixels) return;

    const img = new Image();

    img.src = image;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const canvas = document.createElement("canvas");

    canvas.width = BANNER_WIDTH;
    canvas.height = BANNER_HEIGHT;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      BANNER_WIDTH,
      BANNER_HEIGHT
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const croppedFile = new File(
          [blob],
          `advertisement-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        onCropComplete(croppedFile);
      },
      "image/jpeg",
      0.92
    );
  };

  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Crop Advertisement Banner
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Final image size: 1200 × 450 px
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative h-100 bg-slate-950 sm:h-125">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={BANNER_ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
            objectFit="contain"
          />
        </div>

        {/* Controls */}
        <div className="border-t px-5 py-4">
          <div className="mb-4">
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Zoom
            </label>

            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="h-10 rounded-xl border border-slate-200 px-5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={createCroppedImage}
              className="h-10 rounded-xl bg-slate-900 px-6 text-xs font-bold text-white hover:bg-slate-800"
            >
              Crop & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}