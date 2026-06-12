"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
};

type FullscreenElement = HTMLDivElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: "landscape") => Promise<void>;
  unlock?: () => void;
};

interface MobileFullscreenPlayerProps {
  src: string;
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export default function MobileFullscreenPlayer({
  src,
  title,
  children,
  className = "",
}: MobileFullscreenPlayerProps) {
  const playerRef = useRef<FullscreenElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [usesFallback, setUsesFallback] = useState(false);

  const unlockOrientation = () => {
    const orientation = screen.orientation as LockableOrientation | undefined;
    orientation?.unlock?.();
  };

  const clearFallback = () => {
    setUsesFallback(false);
    document.body.classList.remove("mobile-video-fullscreen-open");
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenDocument = document as FullscreenDocument;
      const activeElement =
        document.fullscreenElement ?? fullscreenDocument.webkitFullscreenElement;
      const playerIsFullscreen = activeElement === playerRef.current;

      setIsFullscreen(playerIsFullscreen || usesFallback);
      if (!playerIsFullscreen && !usesFallback) {
        unlockOrientation();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.body.classList.remove("mobile-video-fullscreen-open");
      unlockOrientation();
    };
  }, [usesFallback]);

  const lockLandscape = async () => {
    try {
      const orientation = screen.orientation as LockableOrientation | undefined;
      if (orientation?.lock) {
        await orientation.lock("landscape");
      }
    } catch {
      // CSS keeps the player landscape when the browser blocks orientation lock.
    }
  };

  const enterFullscreen = async () => {
    const player = playerRef.current;
    if (!player) return;

    try {
      if (player.requestFullscreen) {
        await player.requestFullscreen({ navigationUI: "hide" });
      } else if (player.webkitRequestFullscreen) {
        await player.webkitRequestFullscreen();
      } else {
        throw new Error("Fullscreen API is unavailable");
      }
      setIsFullscreen(true);
      await lockLandscape();
    } catch {
      setUsesFallback(true);
      setIsFullscreen(true);
      document.body.classList.add("mobile-video-fullscreen-open");
      await lockLandscape();
    }
  };

  const exitFullscreen = async () => {
    const fullscreenDocument = document as FullscreenDocument;

    if (usesFallback) {
      clearFallback();
    } else if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (fullscreenDocument.webkitFullscreenElement) {
      await fullscreenDocument.webkitExitFullscreen?.();
    }

    setIsFullscreen(false);
    unlockOrientation();
  };

  const toggleFullscreen = () => {
    void (isFullscreen ? exitFullscreen() : enterFullscreen());
  };

  return (
    <div
      ref={playerRef}
      className={`mobile-video-player ${usesFallback ? "mobile-video-player--fallback" : ""} ${className}`}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      {children}
      <iframe
        key={src}
        src={src}
        className="absolute inset-0 h-full w-full"
        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="autoplay; encrypted-media; picture-in-picture"
        title={title}
      />
      <button
        type="button"
        className="mobile-video-player__fullscreen"
        onClick={toggleFullscreen}
        onDoubleClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        aria-label={isFullscreen ? "Keluar dari layar penuh" : "Masuk ke layar penuh landscape"}
        title={isFullscreen ? "Keluar dari layar penuh" : "Layar penuh landscape"}
      >
        {isFullscreen ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
      </button>
    </div>
  );
}
