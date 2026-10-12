import React, { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { CheckCircle2, X, Key, Copy, Download, Check } from "lucide-react";

export default function ShopDetailsModal({ createdShopModal, onClose }) {
  const [copiedKey, setCopiedKey] = useState(false);
  const qrRef = useRef(null);

  if (!createdShopModal) return null;

  // Extract ID and build target URL
  const shopId = createdShopModal._id || createdShopModal.id;
  const baseURL= import.meta.env.VITE_CLIENT_URL;
  const targetUrl = `${baseURL}/details/${shopId}`;
  // const targetUrl = `${window.location.origin}/details/${shop.id}`;

  // Fallback username calculation
  const username =
    createdShopModal?.credentials?.username ||
    `owner_${String(shopId ?? "").slice(-4)}`;
  const password = createdShopModal?.credentials?.password || "Pass@123";

  // Copy Credentials Handler
  const handleCopyCredentials = () => {
    const textToCopy = `Shop: ${createdShopModal.shopName}\nUser: ${username}\nPass: ${password}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Download QR Code as PNG
  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    const image = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = image;
    anchor.download = `${createdShopModal.shopName || "shop"}-QR.png`;
    anchor.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#fffdf9] max-w-md w-full rounded-2xl border border-stone-200 shadow-xl overflow-hidden p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                Shop Details
              </h3>
              <p className="text-xs text-stone-500">ID: {shopId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic QR Code Box */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-center space-y-3">
          <div
            ref={qrRef}
            className="w-32 h-32 mx-auto bg-white p-2.5 rounded-lg border border-stone-200 shadow-xs flex items-center justify-center"
          >
            <QRCodeCanvas
              value={targetUrl}
              size={112}
              level="H"
              includeMargin={false}
            />
          </div>

          <div>
            <p className="text-[11px] font-semibold text-stone-700">
              {createdShopModal.shopName}
            </p>
            <p className="text-[10px] text-stone-400 mt-0.5">
              Scan to view digital storefront profile
            </p>
          </div>

          <button
            onClick={handleDownloadQR}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Download QR Code</span>
          </button>
        </div>

        {/* Credentials Section */}
        {/* <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-700" /> Owner Login Credentials
            </span>
          </div>

          <div className="text-xs space-y-1 font-mono text-stone-800 bg-white p-2.5 rounded-lg border border-amber-200/50">
            <p>
              <strong>Username:</strong> {username}
            </p>
            <p>
              <strong>Password:</strong> {password}
            </p>
          </div>

          <button
            onClick={handleCopyCredentials}
            className="w-full py-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200/70 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            {copiedKey ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy credentials to share</span>
              </>
            )}
          </button>
        </div> */}

        {/* Close Action Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-stone-900 hover:bg-black text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs"
        >
          Done
        </button>

      </div>
    </div>
  );
}