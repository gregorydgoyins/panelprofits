import { NextResponse } from "next/server";
import { getCurrentUser, getUserProfile } from "@/lib/account/queries";
import { getPlayerFirmContext } from "@/lib/game/player-state";
import { getDiaryEntries } from "@/lib/panel-profits/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null, profile: null, playerContext: null, diaryEntries: [] });
  }

  const [profile, playerContext, diaryEntries] = await Promise.all([
    getUserProfile().catch(() => null),
    getPlayerFirmContext(user.id).catch(() => null),
    getDiaryEntries(user.id).catch(() => []),
  ]);

  const displayName = profile?.display_name || user.email?.split("@")[0] || "Account";

  return NextResponse.json({
    authenticated: true,
    user: { id: user.id, email: user.email },
    profile,
    displayName,
    playerContext,
    diaryEntries,
  });
}
