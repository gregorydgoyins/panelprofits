"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import type {
  GameRole,
  BrokerLevel,
  LotItem,
  RoundStatus,
  WonBook,
  RoundHistoryItem,
  StickyLotBid,
  BidEvent,
} from "@/lib/sniper/sim/types";
import { RoleSelector } from "./RoleSelector";
import { SniperHUD } from "./SniperHUD";
import { SniperStage } from "./SniperStage";
import { SniperPostMortem } from "./SniperPostMortem";
import { SniperVault } from "./SniperVault";
import { Loader2 } from "lucide-react";

const STORAGE_KEY = "pp_sniper_sim_state_v1";
const ROUND_DURATION_SECS = 240;
const MAX_STICKY_AUCTIONS = 5;

export function SniperGameContainer() {
  const [role, setRole] = useState<GameRole | null>(null);
  const [bankroll, setBankroll] = useState<number>(5000);
  const [startingBankroll, setStartingBankroll] = useState<number>(5000);
  const [brokerLevel, setBrokerLevel] = useState<BrokerLevel>(1);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [consecutiveWins, setConsecutiveWins] = useState<number>(0);
  const [consecutiveLosses, setConsecutiveLosses] = useState<number>(0);
  const [netRoi, setNetRoi] = useState<number>(0);

  const [currentLot, setCurrentLot] = useState<LotItem | null>(null);
  const [candidates, setCandidates] = useState<LotItem[]>([]);
  const [userBid, setUserBid] = useState<number | null>(null);
  const [currentFloorBid, setCurrentFloorBid] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(ROUND_DURATION_SECS);
  const [roundStatus, setRoundStatus] = useState<RoundStatus>("research");
  const [loadingLot, setLoadingLot] = useState<boolean>(false);

  // Multi-Auction Sticky Collation (Max 5 Concurrent Auctions)
  const [stickyBids, setStickyBids] = useState<StickyLotBid[]>([]);
  const [bidEvents, setBidEvents] = useState<BidEvent[]>([]);
  const currentLotTriggersRef = useRef<{ [milestone: string]: boolean }>({});
  const timeRemainingRef = useRef(timeRemaining);
  const currentFloorBidRef = useRef(currentFloorBid);

  useEffect(() => {
    timeRemainingRef.current = timeRemaining;
  }, [timeRemaining]);

  useEffect(() => {
    currentFloorBidRef.current = currentFloorBid;
  }, [currentFloorBid]);

  const [vault, setVault] = useState<WonBook[]>([]);
  const [history, setHistory] = useState<RoundHistoryItem[]>([]);
  const [isVaultOpen, setIsVaultOpen] = useState<boolean>(false);

  // Restore saved bankroll and stats on mount, but let user choose role up front
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.bankroll) setBankroll(parsed.bankroll);
        if (parsed.startingBankroll) setStartingBankroll(parsed.startingBankroll);
        if (parsed.brokerLevel) setBrokerLevel(parsed.brokerLevel);
        if (parsed.roundNumber) setRoundNumber(parsed.roundNumber);
        if (parsed.netRoi) setNetRoi(parsed.netRoi);
        if (Array.isArray(parsed.vault)) setVault(parsed.vault);
        if (Array.isArray(parsed.history)) setHistory(parsed.history);
        if (Array.isArray(parsed.stickyBids)) setStickyBids(parsed.stickyBids);
      }
    } catch (e) {
      console.warn("Failed to read saved sniper state:", e);
    }
  }, []);

  // Save state on change
  useEffect(() => {
    if (!role) return;
    try {
      const stateToSave = {
        role,
        bankroll,
        startingBankroll,
        brokerLevel,
        roundNumber,
        netRoi,
        vault,
        history,
        stickyBids,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn("Failed to persist sniper state:", e);
    }
  }, [role, bankroll, startingBankroll, brokerLevel, roundNumber, netRoi, vault, history, stickyBids]);

  // Fetch next lot from API
  const loadNextLot = useCallback(
    async (activeRole: GameRole, activeLevel: BrokerLevel) => {
      setLoadingLot(true);
      setUserBid(null);
      setTimeRemaining(ROUND_DURATION_SECS);
      setRoundStatus("research");

      try {
        const res = await fetch(`/api/sniper/sim/lot?role=${activeRole}&level=${activeLevel}`);
        const data = await res.json();
        if (data.ok && data.lot) {
          setCurrentLot(data.lot);
          currentLotTriggersRef.current = {};
          const openBid = data.lot.openingBid;
          const curBid = data.lot.currentBid || openBid;
          const lotSecs = data.lot.secondsRemaining ?? ROUND_DURATION_SECS;
          setTimeRemaining(lotSecs);
          setCurrentFloorBid(curBid);

          const initialEvents: BidEvent[] = [
            {
              timestamp: Date.now() - 120000,
              bidder: "floor",
              amount: openBid,
              clockSecs: lotSecs,
              note: "Floor opening comp",
            },
          ];

          if (curBid > openBid) {
            const midSecs = Math.round(ROUND_DURATION_SECS * 0.65);
            const midBid = Math.round(openBid + (curBid - openBid) * 0.55);
            initialEvents.push({
              timestamp: Date.now() - 45000,
              bidder: "rival",
              amount: midBid,
              clockSecs: midSecs,
              note: "Early Proxy Discovery",
            });
            initialEvents.push({
              timestamp: Date.now(),
              bidder: "floor",
              amount: curBid,
              clockSecs: ROUND_DURATION_SECS,
              note: "Active Floor Line",
            });
          }

          setBidEvents(initialEvents);

          if (Array.isArray(data.lots) && data.lots.length > 0) {
            setCandidates(data.lots);
          } else {
            setCandidates([data.lot]);
          }
        }
      } catch (err) {
        console.error("Error loading next simulation lot:", err);
      } finally {
        setLoadingLot(false);
      }
    },
    []
  );

  // Candidate Selection Handler (from Row of Decisions or Sticky Rail)
  const handleSelectCandidate = (selected: LotItem) => {
    setCurrentLot(selected);
    currentLotTriggersRef.current = {};

    // If already in sticky bids, sync active user bid and clock
    const existingSticky = stickyBids.find((b) => b.lotId === selected.id);
    if (existingSticky) {
      setUserBid(existingSticky.userBid);
      setCurrentFloorBid(existingSticky.currentBid);
      setTimeRemaining(existingSticky.timeRemaining);
      setBidEvents(existingSticky.bidHistory);
      setRoundStatus(
        existingSticky.status === "won"
          ? "hammer_won"
          : existingSticky.status === "lost"
          ? "hammer_lost"
          : existingSticky.status === "chickened_out"
          ? "chickened_out"
          : "bidding"
      );
    } else {
      setUserBid(null);
      const openBid = selected.openingBid;
      const curBid = selected.currentBid || openBid;
      const secs = selected.secondsRemaining ?? ROUND_DURATION_SECS;
      setCurrentFloorBid(curBid);
      setTimeRemaining(secs);

      const initialEvents: BidEvent[] = [
        {
          timestamp: Date.now() - 120000,
          bidder: "floor",
          amount: openBid,
          clockSecs: ROUND_DURATION_SECS,
          note: "Floor opening comp",
        },
      ];

      if (curBid > openBid) {
        const midSecs = Math.round((ROUND_DURATION_SECS + secs) / 2);
        const midBid = Math.round(openBid + (curBid - openBid) * 0.55);
        initialEvents.push({
          timestamp: Date.now() - 35000,
          bidder: "rival",
          amount: midBid,
          clockSecs: midSecs,
          note: "Organic Proxy Push",
        });
        initialEvents.push({
          timestamp: Date.now(),
          bidder: "floor",
          amount: curBid,
          clockSecs: secs,
          note: "Active Floor Line",
        });
      }

      setBidEvents(initialEvents);
      setRoundStatus("research");
    }
  };

  // Full 4-Lot Rail Refresh Handler
  const handleRefreshChoices = async () => {
    if (!role) return;
    try {
      const currentIds = candidates.map((c) => c.id).join(",");
      const res = await fetch(`/api/sniper/sim/lot?role=${role}&level=${brokerLevel}&exclude=${currentIds}`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.lots) && data.lots.length > 0) {
        setCandidates(data.lots);
        if (!data.lots.some((l: LotItem) => l.id === currentLot?.id)) {
          handleSelectCandidate(data.lots[0]);
        }
      }
    } catch (e) {
      console.warn("Could not refresh lot choices:", e);
    }
  };

  // Individual Lot Expiration & Seamless Replacement Handler
  const handleLotExpired = async (expiredId: string) => {
    if (expiredId === currentLot?.id) {
      resolveHammer();
      return;
    }
    if (!role) return;
    try {
      const currentIds = candidates.map((c) => c.id).join(",");
      const res = await fetch(`/api/sniper/sim/lot?role=${role}&level=${brokerLevel}&exclude=${currentIds}`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.lots) && data.lots.length > 0) {
        const replacement =
          data.lots.find((l: LotItem) => !candidates.some((c) => c.id === l.id)) || data.lots[0];
        const freshSecs = replacement.secondsRemaining || Math.floor(900 + Math.random() * 2700);
        replacement.secondsRemaining = freshSecs;
        replacement.totalDurationSeconds = freshSecs;
        setCandidates((prev) => prev.map((c) => (c.id === expiredId ? replacement : c)));
      }
    } catch (e) {
      console.warn("Failed to replace expired rail lot:", e);
    }
  };

  // Role Selection Handler
  const handleSelectRole = (chosenRole: GameRole) => {
    const initialCash = chosenRole === "broker" ? 5000 : 20000;
    setRole(chosenRole);
    setBankroll(initialCash);
    setStartingBankroll(initialCash);
    setBrokerLevel(1);
    setRoundNumber(1);
    setConsecutiveWins(0);
    setConsecutiveLosses(0);
    setNetRoi(0);
    setVault([]);
    setHistory([]);
    setStickyBids([]);
    loadNextLot(chosenRole, 1);
  };

  // Switch Role Handler
  const handleResetRole = () => {
    setRole(null);
    setCurrentLot(null);
    setCandidates([]);
    setStickyBids([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Auto-load lot if role is chosen but no lot loaded
  useEffect(() => {
    if (role && !currentLot && !loadingLot) {
      loadNextLot(role, brokerLevel);
    }
  }, [role, currentLot, loadingLot, brokerLevel, loadNextLot]);

  // ──────────────────────────────────────────────────────────────────────────
  // Playing the Clock Tick Engine (Rival fights at 30s, 5s, 1s & Hammer Resolution)
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!role || loadingLot) return;

    const interval = setInterval(() => {
      // 1. Tick down selected lot timer and check for expiration
      setTimeRemaining((prev) => {
        const newSecs = Math.max(0, prev - 1);
        if (newSecs === 0 && currentLot) {
          if (!currentLotTriggersRef.current.p0) {
            currentLotTriggersRef.current.p0 = true;
            resolveHammer();
          }
        }
        return newSecs;
      });

      // 1b. Organic floor proxy action for currentLot if not yet sticky
      if (currentLot && !stickyBids.some((b) => b.lotId === currentLot.id)) {
        const secs = timeRemainingRef.current - 1;
        const hammer = currentLot.hammerPrice;
        const curBid = currentFloorBidRef.current;

        const bumpFloor = (key: string, minInc: number, maxInc: number, note: string, bidder: "floor" | "rival") => {
          if (!currentLotTriggersRef.current[key] && curBid < hammer) {
            currentLotTriggersRef.current[key] = true;
            const inc = Math.floor(minInc + Math.random() * (maxInc - minInc + 1));
            const nextBid = Math.min(hammer, curBid + inc);
            setCurrentFloorBid(nextBid);
            setBidEvents((prev) => [
              ...prev,
              {
                timestamp: Date.now(),
                bidder,
                amount: nextBid,
                clockSecs: Math.max(0, secs),
                note,
              },
            ]);
          }
        };

        if (secs <= 180 && secs > 130) bumpFloor("p180", 10, 20, "Organic proxy raise", "floor");
        if (secs <= 120 && secs > 70) bumpFloor("p120", 15, 25, "Floor collector bid", "floor");
        if (secs <= 60 && secs > 35) bumpFloor("p60", 15, 30, "Pre-lockout proxy push", "floor");
        if (secs <= 30 && secs > 5) bumpFloor("p30", 20, 35, "30s late proxy bot", "rival");
        if (secs <= 5 && secs > 1) bumpFloor("p5", 25, 50, "5s sniper blitz", "rival");
        if (secs <= 1 && secs > 0) {
          if (!currentLotTriggersRef.current.p1) {
            currentLotTriggersRef.current.p1 = true;
            setCurrentFloorBid(hammer);
            setBidEvents((prev) => [
              ...prev,
              {
                timestamp: Date.now(),
                bidder: "rival",
                amount: hammer,
                clockSecs: 1,
                note: "1s final hammer reserve push",
              },
            ]);
          }
        }
      }

      // 2. Tick down and trigger clock fights for all sticky bidded lots
      setStickyBids((prevBids) => {
        if (!prevBids || prevBids.length === 0) return prevBids;

        return prevBids.map((item) => {
          if (item.status === "won" || item.status === "lost" || item.status === "chickened_out") {
            return item;
          }

          const newSecs = Math.max(0, item.timeRemaining - 1);
          let newCurrentBid = item.currentBid;
          let newStatus: StickyLotBid["status"] = item.status;
          let updatedHistory = [...item.bidHistory];
          let r30 = item.rival30sTriggered;
          let r5 = item.rival5sTriggered;
          let r1 = item.rival1sTriggered;

          // Milestone 1: T <= 30s Clock Fight (Late floor proxy bots)
          if (newSecs <= 30 && newSecs > 5 && !r30) {
            r30 = true;
            const inc = Math.floor(10 + Math.random() * 16); // +$10 to +$25
            newCurrentBid = Math.min(item.hammerPrice, item.currentBid + inc);
            updatedHistory.push({
              timestamp: Date.now(),
              bidder: "rival",
              amount: newCurrentBid,
              clockSecs: newSecs,
              note: "30s late proxy bot",
            });
            if (newCurrentBid > item.userBid) {
              newStatus = "outbid";
            }
          }

          // Milestone 2: T <= 5s Sniping Blitz (Rapid snipers)
          if (newSecs <= 5 && newSecs > 1 && !r5) {
            r5 = true;
            const inc = Math.floor(25 + Math.random() * 26); // +$25 to +$50
            newCurrentBid = Math.min(item.hammerPrice, Math.max(item.currentBid + inc, item.userBid - 5));
            updatedHistory.push({
              timestamp: Date.now(),
              bidder: "rival",
              amount: newCurrentBid,
              clockSecs: newSecs,
              note: "5s sniper blitz",
            });
            if (newCurrentBid > item.userBid) {
              newStatus = "outbid";
            }
          }

          // Milestone 3: T <= 1s Final Push (Tests full hammer reserve)
          if (newSecs <= 1 && !r1) {
            r1 = true;
            newCurrentBid = item.hammerPrice;
            updatedHistory.push({
              timestamp: Date.now(),
              bidder: "rival",
              amount: newCurrentBid,
              clockSecs: newSecs,
              note: "1s final hammer test",
            });
            if (newCurrentBid > item.userBid) {
              newStatus = "outbid";
            }
          }

          // Milestone 4: T = 0s Final Hammer Drop
          if (newSecs === 0 && (item.status === "leading" || item.status === "outbid")) {
            if (item.userBid >= item.hammerPrice) {
              newStatus = "won";
              const cost = item.hammerPrice;
              const profit = item.lot.fmv - cost;

              setBankroll((b) => Math.max(0, Math.round(b - cost)));
              setConsecutiveWins((w) => w + 1);
              setConsecutiveLosses(0);
              setVault((v) => [
                { ...item.lot, purchaseCost: cost, wonAt: new Date().toISOString() },
                ...v,
              ]);
              setHistory((h) => [
                {
                  lotTitle: item.lot.title,
                  grade: item.lot.grade,
                  grader: item.lot.grader,
                  certNumber: item.lot.certNumber,
                  result: "WON",
                  userBid: item.userBid,
                  hammerPrice: item.hammerPrice,
                  fmv: item.lot.fmv,
                  profit,
                  investopediaSlug: item.lot.investopediaSlug,
                  date: new Date().toISOString(),
                },
                ...h,
              ]);
              if (item.lot.id === currentLot?.id) {
                setRoundStatus("hammer_won");
              }
            } else {
              newStatus = "lost";
              setConsecutiveLosses((l) => l + 1);
              setConsecutiveWins(0);
              setHistory((h) => [
                {
                  lotTitle: item.lot.title,
                  grade: item.lot.grade,
                  grader: item.lot.grader,
                  certNumber: item.lot.certNumber,
                  result: "LOST",
                  userBid: item.userBid,
                  hammerPrice: item.hammerPrice,
                  fmv: item.lot.fmv,
                  profit: 0,
                  investopediaSlug: item.lot.investopediaSlug,
                  date: new Date().toISOString(),
                },
                ...h,
              ]);
              if (item.lot.id === currentLot?.id) {
                setRoundStatus("hammer_lost");
              }
            }
          }

          // If this lot matches the one being inspected in currentLot, sync local view
          if (item.lot.id === currentLot?.id) {
            setCurrentFloorBid(newCurrentBid);
            setBidEvents(updatedHistory);
          }

          return {
            ...item,
            timeRemaining: newSecs,
            currentBid: newCurrentBid,
            status: newStatus,
            bidHistory: updatedHistory,
            rival30sTriggered: r30,
            rival5sTriggered: r5,
            rival1sTriggered: r1,
          };
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [role, loadingLot, currentLot]);

  // Fallback direct hammer resolution if needed
  const resolveHammer = () => {
    if (!currentLot) return;
    const bid = userBid ?? 0;
    const hammer = currentLot.hammerPrice;
    const fmv = currentLot.fmv;

    if (bid >= hammer) {
      const cost = hammer;
      const profit = fmv - cost;
      setBankroll((prev) => Math.round(prev - cost));
      setRoundStatus("hammer_won");
      setConsecutiveWins((prev) => prev + 1);
      setConsecutiveLosses(0);
      setVault((prev) => [{ ...currentLot, purchaseCost: cost, wonAt: new Date().toISOString() }, ...prev]);
      setHistory((prev) => [
        {
          lotTitle: currentLot.title,
          grade: currentLot.grade,
          grader: currentLot.grader,
          certNumber: currentLot.certNumber,
          result: "WON",
          userBid: bid,
          hammerPrice: hammer,
          fmv,
          profit,
          investopediaSlug: currentLot.investopediaSlug,
          date: new Date().toISOString(),
        },
        ...prev,
      ]);
    } else {
      setRoundStatus("hammer_lost");
      setConsecutiveLosses((prev) => prev + 1);
      setConsecutiveWins(0);
      setHistory((prev) => [
        {
          lotTitle: currentLot.title,
          grade: currentLot.grade,
          grader: currentLot.grader,
          certNumber: currentLot.certNumber,
          result: "LOST",
          userBid: bid > 0 ? bid : null,
          hammerPrice: hammer,
          fmv,
          profit: 0,
          investopediaSlug: currentLot.investopediaSlug,
          date: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    setNetRoi(() => {
      const totalP = bankroll - startingBankroll;
      return startingBankroll > 0 ? (totalP / startingBankroll) * 100 : 0;
    });
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Multi-Auction Collation Bidding (Sticky Rail Up to 5 Lots)
  // ──────────────────────────────────────────────────────────────────────────
  const handlePlaceBid = (amount: number, targetLotParam?: LotItem) => {
    const lotToBid = targetLotParam || currentLot;
    if (!lotToBid || amount > bankroll) return;

    // Check 5-lot sticky limit
    const isAlreadySticky = stickyBids.some((b) => b.lotId === lotToBid.id);
    if (!isAlreadySticky && stickyBids.length >= MAX_STICKY_AUCTIONS) {
      alert("Sticky auction limit reached (5/5). You must wait out final outcomes or trigger Chicken Out (-10%) on an active lot to release a slot.");
      return;
    }

    const clockAtBid = lotToBid.id === currentLot?.id ? timeRemaining : (lotToBid.secondsRemaining ?? 240);
    const newEvent: BidEvent = {
      timestamp: Date.now(),
      bidder: "user",
      amount,
      clockSecs: clockAtBid,
      note: "Accepted user snipe",
    };

    setStickyBids((prev) => {
      const idx = prev.findIndex((b) => b.lotId === lotToBid.id);
      if (idx >= 0) {
        const existing = prev[idx];
        const updated = [...prev];
        updated[idx] = {
          ...existing,
          userBid: amount,
          currentBid: Math.max(existing.currentBid, amount),
          status: "leading",
          bidHistory: [...existing.bidHistory, newEvent],
        };
        return updated;
      } else {
        const newSticky: StickyLotBid = {
          lotId: lotToBid.id,
          lot: lotToBid,
          userBid: amount,
          currentBid: Math.max(lotToBid.openingBid, amount),
          timeRemaining: clockAtBid,
          hammerPrice: lotToBid.hammerPrice,
          status: "leading",
          bidHistory: [
            {
              timestamp: Date.now() - 3000,
              bidder: "floor",
              amount: lotToBid.openingBid,
              clockSecs: clockAtBid,
              note: "Floor opening",
            },
            newEvent,
          ],
        };
        return [...prev, newSticky];
      }
    });

    if (lotToBid.id === currentLot?.id) {
      setUserBid(amount);
      setCurrentFloorBid(Math.max(currentFloorBid, amount));
      setRoundStatus("bidding");
      setBidEvents((prev) => [...prev, newEvent]);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Chicken Out Handler (Flat 10% penalty to release sticky lot & cut exposure)
  // ──────────────────────────────────────────────────────────────────────────
  const handleChickenOutLot = (lotId: string) => {
    const target = stickyBids.find((b) => b.lotId === lotId);
    if (!target) return;

    const penalty = Math.round(target.userBid * 0.10);
    setBankroll((prev) => Math.max(0, prev - penalty));

    // Release sticky slot immediately
    setStickyBids((prev) => prev.filter((b) => b.lotId !== lotId));

    // Record Chicken Out in history
    const histItem: RoundHistoryItem = {
      lotTitle: target.lot.title,
      grade: target.lot.grade,
      grader: target.lot.grader,
      certNumber: target.lot.certNumber,
      result: "CHICKENED_OUT",
      userBid: target.userBid,
      hammerPrice: target.lot.hammerPrice,
      fmv: target.lot.fmv,
      profit: -penalty,
      investopediaSlug: target.lot.investopediaSlug,
      date: new Date().toISOString(),
    };
    setHistory((prev) => [histItem, ...prev]);

    if (lotId === currentLot?.id) {
      setUserBid(null);
      setRoundStatus("chickened_out");
    }
  };

  // Quick Chicken Out on current lot
  const handleChickenOut = () => {
    if (!currentLot) return;
    handleChickenOutLot(currentLot.id);
  };

  // Raise bid on any sticky lot from the sticky collation bar
  const handleRaiseStickyBid = (lotId: string, newAmount: number) => {
    const target = stickyBids.find((b) => b.lotId === lotId);
    if (target) {
      handlePlaceBid(newAmount, target.lot);
    }
  };

  // Pass Lot Handler
  const handlePassLot = () => {
    if (!role) return;
    setRoundNumber((prev) => prev + 1);
    loadNextLot(role, brokerLevel);
  };

  // Next Lot (after PostMortem)
  const handleProceedNextLot = () => {
    if (!role) return;
    setRoundNumber((prev) => prev + 1);
    loadNextLot(role, brokerLevel);
  };

  // Liquidate a Book to Secondary Dealer at 90% FMV
  const handleLiquidateBook = (bookId: string, liquidationValue: number) => {
    setVault((prev) => prev.filter((b) => b.id !== bookId));
    setBankroll((prev) => prev + liquidationValue);
  };

  // Render Role Selector if no role chosen
  if (!role) {
    return <RoleSelector onSelectRole={handleSelectRole} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Top HUD */}
      <SniperHUD
        role={role}
        bankroll={bankroll}
        startingBankroll={startingBankroll}
        brokerLevel={brokerLevel}
        roundNumber={roundNumber}
        netRoi={netRoi}
        vault={vault}
        onOpenVault={() => setIsVaultOpen(true)}
        onResetRole={handleResetRole}
      />

      {/* Main Floor / Loading */}
      {loadingLot || !currentLot ? (
        <div className="rounded-xl border border-slate-800 bg-[#070A11] py-32 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          <p className="font-mono text-sm text-slate-400 uppercase tracking-wider">
            Fetching next certified exchange lot from sovereign catalog...
          </p>
        </div>
      ) : (
        <SniperStage
          role={role}
          lot={currentLot}
          candidates={candidates}
          onSelectLot={handleSelectCandidate}
          onRefreshChoices={handleRefreshChoices}
          onLotExpired={handleLotExpired}
          userBid={userBid}
          bankroll={bankroll}
          timeRemaining={timeRemaining}
          onPlaceBid={handlePlaceBid}
          onChickenOut={handleChickenOut}
          onPassLot={handlePassLot}
          stickyBids={stickyBids}
          onChickenOutLot={handleChickenOutLot}
          onRaiseStickyBid={handleRaiseStickyBid}
          currentFloorBid={currentFloorBid}
          bidEvents={bidEvents}
        />
      )}

      {/* Post-Mortem Resolution Modal */}
      {(roundStatus === "hammer_won" || roundStatus === "hammer_lost" || roundStatus === "chickened_out") && currentLot && (
        <SniperPostMortem
          role={role}
          lot={currentLot}
          status={roundStatus}
          userBid={userBid}
          onNextLot={handleProceedNextLot}
          onOpenVault={() => setIsVaultOpen(true)}
          onLiquidateWonBook={() => {
            if (vault.length > 0) {
              const latest = vault[0];
              handleLiquidateBook(latest.id, Math.round(latest.fmv * 0.9));
            }
          }}
        />
      )}

      {/* Vault Drawer Modal */}
      <SniperVault
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        vault={vault}
        onLiquidateBook={handleLiquidateBook}
      />
    </div>
  );
}
