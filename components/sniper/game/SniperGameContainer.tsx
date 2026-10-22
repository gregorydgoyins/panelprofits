"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { GameRole, BrokerLevel, LotItem, RoundStatus, WonBook, RoundHistoryItem } from "@/lib/sniper/sim/types";
import { RoleSelector } from "./RoleSelector";
import { SniperHUD } from "./SniperHUD";
import { SniperStage } from "./SniperStage";
import { SniperPostMortem } from "./SniperPostMortem";
import { SniperVault } from "./SniperVault";
import { Loader2 } from "lucide-react";

const STORAGE_KEY = "pp_sniper_sim_state_v1";
const ROUND_DURATION_SECS = 240;

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
  const [timeRemaining, setTimeRemaining] = useState<number>(ROUND_DURATION_SECS);
  const [roundStatus, setRoundStatus] = useState<RoundStatus>("research");
  const [loadingLot, setLoadingLot] = useState<boolean>(false);

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
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn("Failed to persist sniper state:", e);
    }
  }, [role, bankroll, startingBankroll, brokerLevel, roundNumber, netRoi, vault, history]);

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

  // Candidate Selection Handler (from Row of Decisions)
  const handleSelectCandidate = (selected: LotItem) => {
    setCurrentLot(selected);
    setUserBid(null);
    setRoundStatus("research");
    if (selected.secondsRemaining && selected.secondsRemaining > 0) {
      setTimeRemaining(selected.secondsRemaining);
    }
  };

  // Full 4-Lot Rail Refresh Handler
  const handleRefreshChoices = async () => {
    if (!role) return;
    try {
      const res = await fetch(`/api/sniper/sim/lot?role=${role}&level=${brokerLevel}`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.lots) && data.lots.length > 0) {
        setCandidates(data.lots);
        if (!data.lots.some((l: LotItem) => l.id === currentLot?.id)) {
          setCurrentLot(data.lots[0]);
          setUserBid(null);
          setTimeRemaining(data.lots[0].secondsRemaining ?? ROUND_DURATION_SECS);
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
      const res = await fetch(`/api/sniper/sim/lot?role=${role}&level=${brokerLevel}`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.lots) && data.lots.length > 0) {
        const replacement =
          data.lots.find((l: LotItem) => !candidates.some((c) => c.id === l.id)) || data.lots[0];
        const freshSecs = Math.floor(900 + Math.random() * 2700);
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
    loadNextLot(chosenRole, 1);
  };

  // Switch Role Handler
  const handleResetRole = () => {
    setRole(null);
    setCurrentLot(null);
    setCandidates([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Auto-load lot if role is chosen but no lot loaded
  useEffect(() => {
    if (role && !currentLot && !loadingLot) {
      loadNextLot(role, brokerLevel);
    }
  }, [role, currentLot, loadingLot, brokerLevel, loadNextLot]);

  // Timer Tick Engine
  useEffect(() => {
    if (!role || !currentLot || loadingLot) return;
    if (roundStatus === "hammer_won" || roundStatus === "hammer_lost" || roundStatus === "chickened_out") return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Timer reached 0: Hammer resolution!
          clearInterval(interval);
          resolveHammer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [role, currentLot, loadingLot, roundStatus, userBid]);

  // Hammer Resolution Logic
  const resolveHammer = () => {
    if (!currentLot) return;

    const bid = userBid ?? 0;
    const hammer = currentLot.hammerPrice;
    const fmv = currentLot.fmv;

    if (bid >= hammer) {
      // Won the auction!
      const cost = hammer; // Vickrey clearing price
      const profit = fmv - cost;

      setBankroll((prev) => Math.round(prev - cost));
      setRoundStatus("hammer_won");
      setConsecutiveWins((prev) => prev + 1);
      setConsecutiveLosses(0);

      // Add to vault
      const wonItem: WonBook = {
        ...currentLot,
        purchaseCost: cost,
        wonAt: new Date().toISOString(),
      };
      setVault((prev) => [wonItem, ...prev]);

      // Record in history
      const histItem: RoundHistoryItem = {
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
      };
      setHistory((prev) => [histItem, ...prev]);

      // Check Broker Promotion
      if (role === "broker") {
        if (brokerLevel === 1 && consecutiveWins >= 2) {
          setBrokerLevel(2);
          setBankroll((b) => b + 2500); // Clients inject +$2,500 AUM
        } else if (brokerLevel === 2 && consecutiveWins >= 4) {
          setBrokerLevel(3);
          setBankroll((b) => b + 5000); // Clients inject +$5,000 AUM
        }
      }
    } else {
      // Outbid or Passed
      setRoundStatus("hammer_lost");
      setConsecutiveLosses((prev) => prev + 1);
      setConsecutiveWins(0);

      const histItem: RoundHistoryItem = {
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
      };
      setHistory((prev) => [histItem, ...prev]);
    }

    // Update cumulative ROI
    setNetRoi((prev) => {
      const totalP = (bankroll - startingBankroll);
      return startingBankroll > 0 ? (totalP / startingBankroll) * 100 : 0;
    });
  };

  // Place Bid Handler
  const handlePlaceBid = (amount: number) => {
    if (amount > bankroll) return;
    setUserBid(amount);
    setRoundStatus("bidding");
  };

  // Chicken Out Handler (Flat 10% penalty before 30s)
  const handleChickenOut = () => {
    if (timeRemaining <= 30 || !userBid || !currentLot) return;

    const penalty = Math.round(userBid * 0.10);
    setBankroll((prev) => Math.max(0, prev - penalty));
    setRoundStatus("chickened_out");

    const histItem: RoundHistoryItem = {
      lotTitle: currentLot.title,
      grade: currentLot.grade,
      grader: currentLot.grader,
      certNumber: currentLot.certNumber,
      result: "CHICKENED_OUT",
      userBid,
      hammerPrice: currentLot.hammerPrice,
      fmv: currentLot.fmv,
      profit: -penalty,
      investopediaSlug: currentLot.investopediaSlug,
      date: new Date().toISOString(),
    };
    setHistory((prev) => [histItem, ...prev]);
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
