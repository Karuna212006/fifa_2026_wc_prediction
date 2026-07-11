import React, { useRef, useEffect, useState } from "react";

/**
 * VideoBlock
 * ----------
 * A general-purpose video player for the site — works as a full-bleed hero
 * background (with text overlay) or as a plain inline card. Handles the
 * boring-but-important stuff so you don't have to think about it per page:
 *
 *  - Autoplay only works muted+inline in most browsers, so those are forced.
 *  - Respects prefers-reduced-motion (shows the poster frame, doesn't autoplay).
 *  - Pauses when scrolled out of view (saves CPU/battery, and mobile data if
 *    combined with `pauseOnMobile`).
 *  - Falls back to a poster image if the video fails to load.
 *
 * Usage — hero background:
 *   <VideoBlock
 *     src="/media/your-clip.mp4"
 *     poster="/media/your-clip-poster.jpg"
 *     mode="background"
 *     height="60vh"
 *   >
 *     <h1 className="text-3xl font-semibold text-stone-100">World Cup 2026 Predictions</h1>
 *   </VideoBlock>
 *
 * Usage — inline card:
 *   <VideoBlock src="/media/highlight.mp4" poster="/media/highlight-poster.jpg" mode="inline" />
 *
 * NOTE: ships pointing at placeholder paths below. Point `src`/`poster` at
 * your own footage — just make sure it's footage you actually have the
 * rights to use (your own recording, licensed stock, or something you made),
 * not broadcast/official tournament footage or branded assets.
 */

const PLACEHOLDER_SRC = "/media/placeholder-hero.mp4";
const PLACEHOLDER_POSTER = "/media/placeholder-hero-poster.jpg";

export default function VideoBlock({
  src = PLACEHOLDER_SRC,
  poster = PLACEHOLDER_POSTER,
  mode = "background", // "background" | "inline"
  height = "60vh",
  loop = true,
  pauseOnMobile = false, // set true to save mobile data — shows poster instead
  children,
  className = "",
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [canPlay, setCanPlay] = useState(true);
  const [failed, setFailed] = useState(false);

  // Respect reduced-motion and (optionally) mobile data preferences up front.
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmallScreen = window.innerWidth < 768;
    setCanPlay(!reduceMotion && !(pauseOnMobile && isSmallScreen));
  }, [pauseOnMobile]);

  // Pause/resume based on viewport visibility.
  useEffect(() => {
    if (!canPlay || !videoRef.current || !containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {}); // ignore autoplay-blocked errors
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [canPlay]);

  const showVideo = canPlay && !failed;

  const videoEl = showVideo ? (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      loop={loop}
      playsInline
      autoPlay
      onError={() => setFailed(true)}
      className="w-full h-full object-cover"
    />
  ) : (
    <img src={poster} alt="" className="w-full h-full object-cover" />
  );

  if (mode === "inline") {
    return (
      <div
        ref={containerRef}
        className={`rounded-lg overflow-hidden border border-emerald-800 ${className}`}
      >
        {videoEl}
      </div>
    );
  }

  // "background" mode: video fills the container, content sits on top.
  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-emerald-950 ${className}`}
      style={{ height }}
    >
      <div className="absolute inset-0">{videoEl}</div>
      <div className="absolute inset-0 bg-emerald-950/40" /> {/* darken for text legibility */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        {children}
      </div>
    </div>
  );
}
