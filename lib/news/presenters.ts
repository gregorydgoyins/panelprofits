export interface PresenterAvatar {
  id: string;
  name: string;
  role: string;
  ethnicity: string;
  avatarImage: string;
  videoSampleUrl: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

/**
 * The official broadcast anchor for the Panel Profits Live Newsdesk.
 * Anchors breaking catalyst broadcasts from the live video desk.
 */
export const LEAD_BROADCAST_ANCHOR: PresenterAvatar = {
  id: "alex-morgan",
  name: "Alex Morgan",
  role: "Lead Broadcast Anchor",
  ethnicity: "Lead Anchor",
  avatarImage: "/media/anchor-face.jpg",
  videoSampleUrl: "/media/newsdesk-loop.mp4",
  badgeBg: "bg-purple-950/60",
  badgeBorder: "border-purple-500/50",
  badgeText: "text-purple-300",
};

/**
 * The broadcast anchor registry.
 * Alex Morgan is the verified newsdesk anchor representing the operational live video feed.
 */
export const PRESENTERS_REGISTRY: PresenterAvatar[] = [
  LEAD_BROADCAST_ANCHOR,
];
