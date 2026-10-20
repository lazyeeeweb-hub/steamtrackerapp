/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Code2,
  BookOpen,
  Columns,
  Play,
  Pause,
  ShieldCheck,
  ShieldAlert,
  FastForward,
  RotateCcw,
  Sparkles,
  Gamepad2,
  ExternalLink,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TrackedGame } from './utils/playtimeUtils';
import { INITIAL_TRACKED_GAMES } from './data/mockGames';
import { AndroidEmulator } from './components/AndroidEmulator';
import { CodeInspector } from './components/CodeInspector';
import { ArchitectureGuide } from './components/ArchitectureGuide';

type ActiveViewMode = 'split' | 'simulator' | 'code' | 'architecture';

export default function App() {
  const [games, setGames] = useState<TrackedGame[]>(() => {
    return JSON.parse(JSON.stringify(INITIAL_TRACKED_GAMES));
  });

  const [viewMode, setViewMode] = useState<ActiveViewMode>('split');
  const [isServiceRunning, setIsServiceRunning] = useState<boolean>(true);
  const [hasPermission, setHasPermission] = useState<boolean>(true);
  const [activeGameId, setActiveGameId] = useState<string | null>('game-1'); // Cyberpunk 2077 initially active
  const [activeSessionSeconds, setActiveSessionSeconds] = useState<number>(42 * 60 + 15); // 42m 15s session
  const [timeMultiplier, setTimeMultiplier] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Real-time tracking tick simulation
  useEffect(() => {
    if (!isServiceRunning || !hasPermission || !activeGameId) return;

    const interval = setInterval(() => {
      const increment = 1 * timeMultiplier;
      setActiveSessionSeconds((prev) => prev + increment);

      setGames((prevGames) =>
        prevGames.map((game) => {
          if (game.id === activeGameId) {
            const newTotal = game.totalPlaytimeSeconds + increment;
            return {
              ...game,
              totalPlaytimeSeconds: newTotal,
              lastPlayedTimestamp: Date.now(),
            };
          }
          return game;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isServiceRunning, hasPermission, activeGameId, timeMultiplier]);

  const activeGame = games.find((g) => g.id === activeGameId);

  const handleResetData = () => {
    setGames(JSON.parse(JSON.stringify(INITIAL_TRACKED_GAMES)));
    setActiveGameId('game-1');
    setActiveSessionSeconds(42 * 60 + 15);
    setIsServiceRunning(true);
    setHasPermission(true);
    showToast('Reset library to default demo state');
  };

  return (
    <div className="min-h-screen bg-[#0a0e14] text-[#c7d5e0] flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Application Header */}
      <header className="bg-[#121922] border-b border-[#2a475e]/70 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-md">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1a9fff] to-[#0d5999] p-0.5 shadow-lg flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-black tracking-wider text-white uppercase font-sans">
                SteamWise Tracker
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#1b2838] text-[#66c0f4] border border-[#2a475e] font-mono font-bold">
                Android Edition
              </span>
            </div>
            <p className="text-[11px] text-[#8f98a0]">
              Kotlin • Jetpack Compose • Room Database • UsageStatsManager
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-[#0a0e14] p-1 rounded-xl border border-[#2a475e]/80">
          <button
            onClick={() => setViewMode('split')}
            className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'split'
                ? 'bg-[#1a9fff] text-white shadow'
                : 'text-[#8f98a0] hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Dual View</span>
          </button>
          <button
            onClick={() => setViewMode('simulator')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'simulator'
                ? 'bg-[#1a9fff] text-white shadow'
                : 'text-[#8f98a0] hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>App Simulator</span>
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'code'
                ? 'bg-[#1a9fff] text-white shadow'
                : 'text-[#8f98a0] hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Source Code</span>
          </button>
          <button
            onClick={() => setViewMode('architecture')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'architecture'
                ? 'bg-[#1a9fff] text-white shadow'
                : 'text-[#8f98a0] hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Architecture Guide</span>
          </button>
        </div>

        {/* Global Simulation Toolbar */}
        <div className="flex items-center space-x-2">
          {/* Permission simulator toggle */}
          <button
            onClick={() => {
              setHasPermission(!hasPermission);
              showToast(
                hasPermission
                  ? 'Revoked PACKAGE_USAGE_STATS permission (warning card shown)'
                  : 'Granted PACKAGE_USAGE_STATS permission'
              );
            }}
            title="Toggle Usage Access Permission state"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition-all ${
              hasPermission
                ? 'bg-[#1b4021]/60 text-[#a4d007] border-[#5c7e10]/60'
                : 'bg-[#332014] text-[#ff9800] border-[#ff9800]/60 animate-pulse'
            }`}
          >
            {hasPermission ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Permission: Granted</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Permission: Revoked</span>
              </>
            )}
          </button>

          {/* Speed multiplier */}
          <button
            onClick={() => {
              const next = timeMultiplier === 1 ? 10 : timeMultiplier === 10 ? 60 : 1;
              setTimeMultiplier(next);
              showToast(`Time simulation speed: ${next}x`);
            }}
            className="px-2.5 py-1.5 bg-[#171d25] hover:bg-[#222c38] text-[#66c0f4] border border-[#2a475e] rounded-lg text-xs font-mono font-bold flex items-center space-x-1 transition-all"
            title="Accelerate session time accumulation"
          >
            <FastForward className="w-3 h-3" />
            <span>{timeMultiplier}x Speed</span>
          </button>

          {/* Reset button */}
          <button
            onClick={handleResetData}
            title="Reset demo data"
            className="p-1.5 bg-[#171d25] hover:bg-[#222c38] text-[#8f98a0] hover:text-white border border-[#2a475e] rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-[#1b2838] border border-[#1a9fff] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 z-50 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#1a9fff]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 p-3 md:p-6 overflow-hidden max-w-[1700px] w-full mx-auto">
        {viewMode === 'split' && (
          <div className="h-[calc(100vh-90px)] grid grid-cols-1 lg:grid-cols-12 gap-6 items-start overflow-hidden">
            {/* Left: Phone Emulator */}
            <div className="lg:col-span-5 h-full flex flex-col items-center justify-center overflow-y-auto custom-scrollbar p-2">
              <AndroidEmulator
                games={games}
                setGames={setGames}
                isServiceRunning={isServiceRunning}
                setIsServiceRunning={setIsServiceRunning}
                hasPermission={hasPermission}
                setHasPermission={setHasPermission}
                activeGameId={activeGameId}
                setActiveGameId={setActiveGameId}
                activeSessionSeconds={activeSessionSeconds}
              />
            </div>

            {/* Right: Code Inspector */}
            <div className="lg:col-span-7 h-full flex flex-col overflow-hidden">
              <CodeInspector />
            </div>
          </div>
        )}

        {viewMode === 'simulator' && (
          <div className="h-[calc(100vh-90px)] flex items-center justify-center p-2 overflow-y-auto">
            <AndroidEmulator
              games={games}
              setGames={setGames}
              isServiceRunning={isServiceRunning}
              setIsServiceRunning={setIsServiceRunning}
              hasPermission={hasPermission}
              setHasPermission={setHasPermission}
              activeGameId={activeGameId}
              setActiveGameId={setActiveGameId}
              activeSessionSeconds={activeSessionSeconds}
            />
          </div>
        )}

        {viewMode === 'code' && (
          <div className="h-[calc(100vh-90px)]">
            <CodeInspector />
          </div>
        )}

        {viewMode === 'architecture' && (
          <div className="h-[calc(100vh-90px)] bg-[#101720] rounded-2xl border border-[#2a475e]/70 overflow-hidden shadow-2xl">
            <ArchitectureGuide />
          </div>
        )}
      </main>
    </div>
  );
}
