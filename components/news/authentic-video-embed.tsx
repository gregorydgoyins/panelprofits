import React from "react";

export interface AuthenticVideo {
  embedUrl: string;
  provider: "youtube" | "vimeo" | "native";
  videoId?: string;
}

/**
 * Extracts authentic external video embed information from story text, URLs, or metadata.
 * Detects YouTube, Vimeo, and direct MP4 video URLs.
 */
export function extractAuthenticVideo(
  text: string | null | undefined,
  url: string | null | undefined
): AuthenticVideo | null {
  const combined = `${url || ""} ${text || ""}`;

  // YouTube match (watch, embed, youtu.be, shorts)
  const ytMatch = combined.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`,
      provider: "youtube",
      videoId: ytMatch[1],
    };
  }

  // Vimeo match
  const vimeoMatch = combined.match(
    /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:video\/)?([0-9]{6,12})/i
  );
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      provider: "vimeo",
      videoId: vimeoMatch[1],
    };
  }

  // Direct MP4 / WebM video match
  const mp4Match = combined.match(/(https?:\/\/[^\s"'<>]+\.(?:mp4|webm))/i);
  if (mp4Match && mp4Match[1]) {
    return {
      embedUrl: mp4Match[1],
      provider: "native",
    };
  }

  return null;
}

export function AuthenticVideoEmbed({
  video,
  headline,
}: {
  video: AuthenticVideo;
  headline: string;
}) {
  return (
    <div className="mt-8 overflow-hidden rounded border border-slate-800 bg-[#07090F] shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#0b0f17] px-4 py-2 text-[10px] uppercase font-mono tracking-wider text-cyan-400">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          Authentic Source Media // {video.provider.toUpperCase()}
        </span>
        <span className="text-slate-500">Official Publisher Footage</span>
      </div>
      <div className="aspect-video w-full bg-black">
        {video.provider === "native" ? (
          <video
            src={video.embedUrl}
            controls
            playsInline
            className="h-full w-full object-contain"
          />
        ) : (
          <iframe
            src={video.embedUrl}
            title={`${headline} media footage`}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}
