"use client";

import { useState, useCallback } from "react";
import { Share2, QrCode, Code, Link2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GallerySocialSharing as SocialSettings } from "@/types/gallery";

interface GallerySocialShareProps {
  settings: SocialSettings;
  imageUrl: string;
  title?: string;
  description?: string;
  className?: string;
}

export function GallerySocialShare({ settings, imageUrl, title, description, className }: GallerySocialShareProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${title || "Check this out"} - ${description || ""}`.trim();

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [shareUrl]);

  const handleGenerateQr = useCallback(async () => {
    try {
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(shareUrl, { width: 300, margin: 2, color: { dark: "#000000", light: "#ffffff" } });
      setQrDataUrl(url);
      setShowQr(true);
    } catch {}
  }, [shareUrl]);

  const getEmbedCode = () => {
    return `<iframe src="${shareUrl}" width="100%" height="500" frameborder="0" allowfullscreen></iframe>`;
  };

  const handleCopyEmbed = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getEmbedCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [shareUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const platforms: Record<string, { label: string; color: string; share: () => void }> = {
    whatsapp: {
      label: "WhatsApp",
      color: "#25D366",
      share: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, "_blank"),
    },
    twitter: {
      label: "Twitter",
      color: "#1DA1F2",
      share: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank"),
    },
    facebook: {
      label: "Facebook",
      color: "#1877F2",
      share: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank"),
    },
    linkedin: {
      label: "LinkedIn",
      color: "#0A66C2",
      share: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank"),
    },
    telegram: {
      label: "Telegram",
      color: "#26A5E4",
      share: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, "_blank"),
    },
    email: {
      label: "Email",
      color: "#EA4335",
      share: () => window.open(`mailto:?subject=${encodeURIComponent(title || "Shared Image")}&body=${encodeURIComponent(shareText + "\n" + shareUrl)}`, "_blank"),
    },
  };

  if (!settings.enabled) return null;

  const btnClass = "p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors";

  return (
    <div className={cn("relative", className)}>
      <button onClick={() => setShowMenu(!showMenu)} className={btnClass} aria-label="Share">
        <Share2 className="h-4 w-4" />
      </button>

      {showMenu && (
        <div className="absolute bottom-full right-0 mb-2 p-2 rounded-lg bg-gray-900/95 border border-white/10 shadow-xl z-20 min-w-[200px]">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {settings.platforms.map((p) => {
              const plat = platforms[p];
              if (!plat) return null;
              return (
                <button
                  key={p}
                  onClick={plat.share}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-white hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: plat.color }}
                >
                  {plat.label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-1.5">
            <button onClick={handleCopyLink} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs transition-colors">
              {copied ? <Check className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
            {settings.showQrCode && (
              <button onClick={handleGenerateQr} className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs transition-colors">
                <QrCode className="h-3 w-3" /> QR
              </button>
            )}
            {settings.showEmbedButton && (
              <button onClick={handleCopyEmbed} className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs transition-colors">
                <Code className="h-3 w-3" /> Embed
              </button>
            )}
          </div>
        </div>
      )}

      {showQr && qrDataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowQr(false)}>
          <div className="bg-white p-6 rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowQr(false)} className="float-right text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
            <p className="text-center text-sm text-gray-600 mt-2">Scan to view</p>
          </div>
        </div>
      )}
    </div>
  );
}
