"use client";
import { useState, useRef } from "react";
import { Share2, Loader2, Copy, Check } from "lucide-react";
import { toast } from "react-toastify";
import type { ChatThread } from "@/lib/types";
import { ShareService } from "@/lib/sharing/shareService";

interface ShareButtonProps {
  thread: ChatThread;
  projectName?: string;
  className?: string;
}

export default function ShareButton({ thread, projectName, className = "" }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [showManualCopy, setShowManualCopy] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [manualCopySuccess, setManualCopySuccess] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handlers

    if (isSharing) return;

    setIsSharing(true);
    setShowManualCopy(false);
    setManualCopySuccess(false);

    try {
      const shareService = new ShareService();
      const result = await shareService.generateShareableUrl(thread, projectName);

      if (result.success && result.url) {
        setShareUrl(result.url);

        // Try to copy to clipboard
        const copySuccess = await shareService.copyToClipboard(result.url);

        if (copySuccess) {
          toast.success("Share link copied to clipboard!", {
            icon: <Check size={18} color="currentColor" aria-hidden="true" />,
          });
        } else {
          // Show manual copy fallback
          setShowManualCopy(true);
          toast.info("Clipboard access failed. Please copy the link manually.", {
            autoClose: false,
          });
        }
      } else {
        const errorMessage = result.error || "Failed to create share link";

        // Provide more helpful error messages for common issues
        let userFriendlyMessage = errorMessage;
        if (errorMessage === "Invalid message format") {
          userFriendlyMessage = "This conversation contains invalid message data and cannot be shared.";
        } else if (errorMessage === "Cannot share empty conversation") {
          userFriendlyMessage = "Cannot share an empty conversation. Please add some messages first.";
        }

        toast.error(userFriendlyMessage);
      }
    } catch (error) {
      const errorMessage = "An unexpected error occurred while sharing";
      toast.error(errorMessage);
    } finally {
      setIsSharing(false);
    }
  };

  const handleManualCopy = async () => {
    if (!urlInputRef.current) return;

    try {
      // Select the text
      urlInputRef.current.select();
      urlInputRef.current.setSelectionRange(0, 99999); // For mobile devices

      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        setManualCopySuccess(true);
        toast.success("Link copied to clipboard!", {
          icon: <Check size={18} color="currentColor" aria-hidden="true" />,
        });
      } else {
        // Fallback to execCommand (deprecated but still supported)
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            setManualCopySuccess(true);
            toast.success("Link copied to clipboard!", {
              icon: <Check size={18} color="currentColor" aria-hidden="true" />,
            });
          } else {
            toast.info("Please manually copy the selected text");
          }
        } catch {
          toast.info("Please manually copy the selected text");
        }
      }
    } catch {
      toast.info("Please manually copy the selected text");
    }

    // Reset success state after 2 seconds
    setTimeout(() => setManualCopySuccess(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Create a synthetic mouse event for keyboard activation
      const syntheticEvent = {
        stopPropagation: () => { },
        preventDefault: () => { }
      } as React.MouseEvent<HTMLButtonElement>;
      handleShare(syntheticEvent);
    }
  };

  const closeManualCopy = () => {
    setShowManualCopy(false);
    setManualCopySuccess(false);
  };

  return (
    <>
      <button
        aria-label={isSharing ? "Sharing conversation..." : "Share this conversation"}
        aria-describedby="share-button-description"
        title="Share this conversation"
        onClick={handleShare}
        onKeyDown={handleKeyDown}
        disabled={isSharing}
        className={`h-7 w-7 shrink-0 inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-blue-500/20 hover:border-blue-300/30 text-zinc-300 hover:text-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent ${className}`}
      >
        {isSharing ? (
          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
        ) : (
          <Share2 size={14} aria-hidden="true" />
        )}
      </button>

      {/* Hidden description for screen readers */}
      <span id="share-button-description" className="sr-only">
        Creates a shareable link for this conversation that can be viewed by anyone with the URL
      </span>

      {/* Manual Copy Fallback Modal */}
      {showManualCopy && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="manual-copy-title"
          aria-describedby="manual-copy-description"
        >
          <div className="bg-zinc-800 border border-white/10 rounded-lg p-6 max-w-md w-full">
            <h3 id="manual-copy-title" className="text-lg font-semibold text-white mb-3">
              Copy Share Link
            </h3>
            <p id="manual-copy-description" className="text-white/70 text-sm mb-4">
              Automatic clipboard access failed. Please copy the link manually:
            </p>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  ref={urlInputRef}
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-zinc-700 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Share URL"
                />
                <button
                  onClick={handleManualCopy}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Copy link to clipboard"
                >
                  {manualCopySuccess ? (
                    <>
                      <Check size={14} aria-hidden="true" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} aria-hidden="true" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={closeManualCopy}
                  className="px-4 py-2 text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}