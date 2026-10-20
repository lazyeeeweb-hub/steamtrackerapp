import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Clock,
  Play,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  AlertTriangle,
  X,
  Check,
  Signal,
  Wifi,
  Battery,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Award,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TrackedGame, formatPlaytime, getPlaytimeBadge, formatLastPlayed, SortOption, sortGames } from '../utils/playtimeUtils';
import { InstalledDeviceApp, MOCK_INSTALLED_APPS } from '../data/mockGames';

interface AndroidEmulatorProps {
  games: TrackedGame[];
  setGames: React.Dispatch<React.SetStateAction<TrackedGame[]>>;
  isServiceRunning: boolean;
  setIsServiceRunning: (val: boolean) => void;
  hasPermission: boolean;
  setHasPermission: (val: boolean) => void;
  activeGameId: string | null;
  setActiveGameId: (id: string | null) => void;
  activeSessionSeconds: number;
}

export const AndroidEmulator: React.FC<AndroidEmulatorProps> = ({
  games,
  setGames,
  isServiceRunning,
  setIsServiceRunning,
  hasPermission,
  setHasPermission,
  activeGameId,
  setActiveGameId,
  activeSessionSeconds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('playtime_desc');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isAppPickerOpen, setIsAppPickerOpen] = useState(false);
  const [appSearch, setAppSearch] = useState('');
  const [activeMenuGameId, setActiveMenuGameId] = useState<string | null>(null);
  const [currentTimeStr, setCurrentTimeStr] = useState('14:20');
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalSeconds = games.reduce((acc, g) => acc + g.totalPlaytimeSeconds, 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);

  // Filter & Sort
  const filteredGames = games.filter(
    (g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.packageName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sortedGames = sortGames(filteredGames, sortOption);

  const activeGame = games.find((g) => g.id === activeGameId);

  // Add game from picker
  const handleAddGame = (app: InstalledDeviceApp) => {
    if (games.some((g) => g.packageName === app.packageName)) return;

    const newGame: TrackedGame = {
      id: `game-${Date.now()}`,
      packageName: app.packageName,
      title: app.appName,
      iconUri: app.icon,
      headerImageUri: app.icon,
      totalPlaytimeSeconds: 0,
      lastPlayedTimestamp: 0,
      recentPlaytimeSeconds: 0,
      isTracking: true,
      category: app.category as any,
    };

    setGames([newGame, ...games]);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#1a9fff', '#66c0f4', '#a4d007'],
    });
  };

  const handleRemoveGame = (id: string) => {
    setGames(games.filter((g) => g.id !== id));
    if (activeGameId === id) {
      setActiveGameId(null);
    }
    setActiveMenuGameId(null);
  };

  const handleLaunchGame = (game: TrackedGame) => {
    if (activeGameId === game.id) {
      // Toggle off
      setActiveGameId(null);
    } else {
      setActiveGameId(game.id);
      setIsServiceRunning(true);
      if (!hasPermission) {
        setHasPermission(true);
      }
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#5c7e10', '#a4d007', '#1a9fff'],
      });
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-[390px] h-[800px] bg-[#000000] rounded-[48px] p-3 shadow-2xl border-[6px] border-[#252830] ring-1 ring-white/10 flex flex-col overflow-hidden select-none">
      {/* Screen container */}
      <div className="relative w-full h-full bg-[#0e141b] rounded-[38px] flex flex-col overflow-hidden text-[#c7d5e0]">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#151515] mr-3" />
          <div className="w-2 h-2 rounded-full bg-[#0e2a47]" />
        </div>

        {/* Android Status Bar */}
        <div className="pt-2 px-6 pb-1 flex items-center justify-between text-xs text-white/80 font-medium z-30">
          <span className="font-mono text-[11px] font-semibold">{currentTimeStr}</span>
          <div className="flex items-center space-x-2">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center space-x-1">
              <span className="text-[10px]">98%</span>
              <Battery className="w-3.5 h-3.5 text-[#a4d007]" />
            </div>
          </div>
        </div>

        {/* Persistent Android Foreground Service Notification Banner */}
        {isServiceRunning && (
          <div
            onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
            className="mx-3 mt-1 px-3 py-2 bg-[#171d25]/95 backdrop-blur-md border border-[#1a9fff]/40 rounded-xl flex items-center justify-between cursor-pointer shadow-lg hover:border-[#1a9fff] transition-all z-20 group"
          >
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="relative flex-shrink-0">
                <div className="w-7 h-7 rounded-lg bg-[#1a9fff]/20 border border-[#1a9fff]/40 flex items-center justify-center">
                  <Gamepad2 className="w-4 h-4 text-[#1a9fff] animate-pulse" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#a4d007] rounded-full ring-2 ring-[#171d25]" />
              </div>
              <div className="truncate text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#a4d007]">Foreground Service</span>
                  <span className="text-[10px] text-white/40">•</span>
                  <span className="text-[10px] font-mono text-[#66c0f4]">
                    {activeGame ? formatPlaytime(activeSessionSeconds, 'detailed') : 'Monitoring'}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-white truncate">
                  {activeGame ? `In-Game: ${activeGame.title}` : 'SteamWise Tracker Running'}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsServiceRunning(false);
                setActiveGameId(null);
              }}
              className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[10px] font-bold rounded border border-red-500/30 transition-colors"
            >
              Stop
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Steam Header */}
          <div className="bg-[#1b2838] px-4 pt-3 pb-3 border-b border-[#2a475e]/60 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1a9fff] to-[#0e4877] p-0.5 flex items-center justify-center shadow-inner">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h1 className="text-sm font-black tracking-wider text-white uppercase font-sans">SteamWise</h1>
                    <span className="text-[9px] px-1.5 py-0.2 bg-[#1a9fff]/20 text-[#66c0f4] border border-[#1a9fff]/30 rounded font-bold">
                      PRO
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8f98a0]">Playtime Tracker</p>
                </div>
              </div>

              {/* Service Toggle Pill */}
              <button
                onClick={() => {
                  if (isServiceRunning) {
                    setIsServiceRunning(false);
                    setActiveGameId(null);
                  } else {
                    setIsServiceRunning(true);
                  }
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                  isServiceRunning
                    ? 'bg-[#1b4021]/80 text-[#a4d007] border-[#5c7e10]/80 shadow-[0_0_10px_rgba(164,208,7,0.2)]'
                    : 'bg-[#171d25] text-[#8f98a0] border-[#2a475e]'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isServiceRunning ? 'bg-[#a4d007] animate-ping' : 'bg-gray-500'
                  }`}
                />
                <span>{isServiceRunning ? 'TRACKING ON' : 'PAUSED'}</span>
              </button>
            </div>

            {/* Quick Steam Stats Bar */}
            <div className="mt-2.5 grid grid-cols-2 gap-2 bg-[#171d25] p-2 rounded-lg border border-[#2a475e]/40">
              <div className="text-center border-r border-[#2a475e]/40 pr-2">
                <span className="text-xs font-bold text-[#66c0f4] font-mono">{games.length}</span>
                <span className="block text-[9px] font-medium uppercase text-[#8f98a0] tracking-wider">
                  Tracked Games
                </span>
              </div>
              <div className="text-center pl-1">
                <span className="text-xs font-bold text-[#a4d007] font-mono">{totalHours} hrs</span>
                <span className="block text-[9px] font-medium uppercase text-[#8f98a0] tracking-wider">
                  Total Playtime
                </span>
              </div>
            </div>
          </div>

          {/* Usage Access Warning Card if Permission revoked */}
          {!hasPermission && (
            <div className="mx-3 mt-2 p-2.5 bg-[#332014] border border-[#ff9800]/60 rounded-xl flex items-center justify-between text-left shadow-lg animate-fadeIn">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-[#ff9800] flex-shrink-0" />
                <div>
                  <h4 className="text-[11px] font-bold text-white leading-tight">Usage Access Required</h4>
                  <p className="text-[9px] text-[#ffcc80] leading-tight">
                    Android PACKAGE_USAGE_STATS permission needed to track foreground apps.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHasPermission(true)}
                className="ml-2 px-2.5 py-1 bg-[#ff9800] hover:bg-[#ffa726] text-black text-[10px] font-black rounded tracking-wide uppercase transition-colors"
              >
                Grant
              </button>
            </div>
          )}

          {/* Search & Sort Controls */}
          <div className="px-3 pt-2.5 pb-2 flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8f98a0]" />
              <input
                type="text"
                placeholder="Search library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#171d25] border border-[#2a475e]/60 focus:border-[#1a9fff] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#8f98a0] outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8f98a0] hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Sort Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="h-[32px] px-2.5 bg-[#171d25] hover:bg-[#222c38] border border-[#2a475e]/60 rounded-lg flex items-center space-x-1 text-xs text-[#66c0f4] transition-colors"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <ChevronDown className="w-3 h-3" />
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 top-9 w-44 bg-[#171d25] border border-[#2a475e] rounded-lg shadow-2xl py-1 z-30 text-left text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold text-[#8f98a0] uppercase tracking-wider">
                    Sort Library
                  </div>
                  <button
                    onClick={() => {
                      setSortOption('playtime_desc');
                      setShowSortDropdown(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#1b2838] transition-colors ${
                      sortOption === 'playtime_desc' ? 'text-[#1a9fff] font-bold' : 'text-[#c7d5e0]'
                    }`}
                  >
                    <span>Most Played</span>
                    {sortOption === 'playtime_desc' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('recent');
                      setShowSortDropdown(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#1b2838] transition-colors ${
                      sortOption === 'recent' ? 'text-[#1a9fff] font-bold' : 'text-[#c7d5e0]'
                    }`}
                  >
                    <span>Recently Played</span>
                    {sortOption === 'recent' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('name_asc');
                      setShowSortDropdown(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#1b2838] transition-colors ${
                      sortOption === 'name_asc' ? 'text-[#1a9fff] font-bold' : 'text-[#c7d5e0]'
                    }`}
                  >
                    <span>Alphabetical (A-Z)</span>
                    {sortOption === 'name_asc' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Games Grid */}
          <div className="flex-1 overflow-y-auto px-3 pb-20 space-y-2.5 custom-scrollbar">
            {sortedGames.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center px-4">
                <Gamepad2 className="w-12 h-12 text-[#8f98a0]/40 mb-3" />
                <h3 className="text-sm font-bold text-white">No Games Found</h3>
                <p className="text-xs text-[#8f98a0] mt-1">
                  {searchQuery ? 'Try matching another name or package' : 'Add games installed on your phone to track them'}
                </p>
                <button
                  onClick={() => setIsAppPickerOpen(true)}
                  className="mt-4 px-3.5 py-1.5 bg-[#1a9fff] hover:bg-[#66c0f4] text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Game</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {sortedGames.map((game) => {
                  const badge = getPlaytimeBadge(game.totalPlaytimeSeconds);
                  const isCurrentActive = activeGameId === game.id;

                  return (
                    <div
                      key={game.id}
                      className={`group relative bg-[#171d25] rounded-xl border transition-all duration-200 overflow-hidden text-left flex flex-col ${
                        isCurrentActive
                          ? 'border-[#a4d007] shadow-[0_0_15px_rgba(164,208,7,0.25)] ring-1 ring-[#a4d007]'
                          : 'border-[#2a475e]/60 hover:border-[#1a9fff]/70 hover:bg-[#1b2838]'
                      }`}
                    >
                      {/* Banner / Artwork Box */}
                      <div className="relative h-20 w-full overflow-hidden bg-gradient-to-b from-[#1b2838] to-[#101822]">
                        <img
                          src={game.headerImageUri || game.iconUri}
                          alt={game.title}
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-95 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#171d25] via-transparent to-black/30" />

                        {/* In-Game Active Badge */}
                        {isCurrentActive && (
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-[#1b4021]/90 border border-[#a4d007] rounded text-[9px] font-bold text-[#a4d007] flex items-center space-x-1 shadow">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#a4d007] animate-ping" />
                            <span>IN-GAME</span>
                          </div>
                        )}

                        {/* More Menu Toggle */}
                        <div className="absolute top-1 right-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuGameId(activeMenuGameId === game.id ? null : game.id);
                            }}
                            className="w-6 h-6 rounded-full bg-black/60 hover:bg-black/90 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {activeMenuGameId === game.id && (
                            <div className="absolute right-0 top-7 w-36 bg-[#171d25] border border-[#2a475e] rounded-lg shadow-2xl py-1 z-40 text-xs">
                              <button
                                onClick={() => {
                                  handleLaunchGame(game);
                                  setActiveMenuGameId(null);
                                }}
                                className="w-full px-2.5 py-1.5 text-left flex items-center space-x-1.5 text-[#a4d007] hover:bg-[#1b2838]"
                              >
                                <Play className="w-3 h-3" />
                                <span>{isCurrentActive ? 'Stop Playing' : 'Launch Session'}</span>
                              </button>
                              <button
                                onClick={() => handleRemoveGame(game.id)}
                                className="w-full px-2.5 py-1.5 text-left flex items-center space-x-1.5 text-red-400 hover:bg-[#1b2838]"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-2 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white truncate" title={game.title}>
                            {game.title}
                          </h4>
                          <div className="flex items-center space-x-1 mt-0.5 text-[10px] text-[#8f98a0]">
                            <Clock className="w-2.5 h-2.5 text-[#66c0f4]" />
                            <span className="font-mono text-[#c7d5e0]">
                              {formatPlaytime(game.totalPlaytimeSeconds, 'steam_hours')}
                            </span>
                            <span>on record</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <span
                              className="text-[9px] px-1.5 py-0.2 rounded font-semibold truncate max-w-[105px]"
                              style={{
                                color: badge.color,
                                backgroundColor: badge.bgColor,
                                border: `1px solid ${badge.borderColor}40`,
                              }}
                            >
                              {badge.tier}
                            </span>
                          </div>
                        </div>

                        {/* Steam Green Play Button */}
                        <button
                          onClick={() => handleLaunchGame(game)}
                          className={`mt-2 w-full py-1 rounded text-[11px] font-bold flex items-center justify-center space-x-1 shadow transition-all ${
                            isCurrentActive
                              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white'
                              : 'bg-gradient-to-r from-[#5c7e10] to-[#4c6b0c] hover:from-[#6d9613] hover:to-[#5c7e10] text-white'
                          }`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{isCurrentActive ? 'EXIT GAME' : 'PLAY'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Button (+ Add Game) */}
        <button
          onClick={() => setIsAppPickerOpen(true)}
          className="absolute bottom-5 right-5 px-3.5 py-2.5 bg-gradient-to-r from-[#1a9fff] to-[#0e7cdb] hover:from-[#2eabff] hover:to-[#1a9fff] text-white rounded-full font-bold text-xs shadow-xl flex items-center space-x-1.5 border border-white/20 active:scale-95 transition-all z-20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Game</span>
        </button>

        {/* Android App Picker Modal Bottom Sheet */}
        {isAppPickerOpen && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex flex-col justify-end animate-fadeIn">
            <div className="bg-[#171d25] rounded-t-3xl border-t border-[#2a475e] p-4 max-h-[82%] flex flex-col text-left animate-slideUp">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#2a475e]/60">
                <div>
                  <h3 className="text-sm font-bold text-white">Installed Device Apps</h3>
                  <p className="text-[10px] text-[#8f98a0]">
                    Select any game or app on this phone to track
                  </p>
                </div>
                <button
                  onClick={() => setIsAppPickerOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#1b2838] hover:bg-[#222c38] text-white/70 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* App Search Bar */}
              <div className="relative my-2.5">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8f98a0]" />
                <input
                  type="text"
                  placeholder="Filter installed apps..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="w-full bg-[#0e141b] border border-[#2a475e]/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#8f98a0] outline-none"
                />
              </div>

              {/* App List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar max-h-72">
                {MOCK_INSTALLED_APPS.filter(
                  (a) =>
                    a.appName.toLowerCase().includes(appSearch.toLowerCase()) ||
                    a.packageName.toLowerCase().includes(appSearch.toLowerCase())
                ).map((app) => {
                  const isTracked = games.some((g) => g.packageName === app.packageName);

                  return (
                    <div
                      key={app.packageName}
                      className="p-2 rounded-xl bg-[#1b2838]/80 hover:bg-[#1b2838] border border-[#2a475e]/40 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5 overflow-hidden">
                        <img
                          src={app.icon}
                          alt={app.appName}
                          className="w-9 h-9 rounded-lg object-cover border border-[#2a475e]/50"
                        />
                        <div className="truncate">
                          <p className="text-xs font-bold text-white truncate">{app.appName}</p>
                          <p className="text-[10px] text-[#8f98a0] font-mono truncate">{app.packageName}</p>
                        </div>
                      </div>

                      {isTracked ? (
                        <span className="px-2 py-1 rounded bg-[#1b4021] text-[#a4d007] text-[10px] font-bold border border-[#5c7e10]/60 flex items-center space-x-1 flex-shrink-0">
                          <Check className="w-3 h-3" />
                          <span>Tracked</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddGame(app)}
                          className="px-2.5 py-1 rounded bg-[#1a9fff] hover:bg-[#66c0f4] text-white text-[10px] font-bold flex items-center space-x-1 flex-shrink-0 transition-colors shadow"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Track</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Android Navigation Bar */}
        <div className="h-5 bg-[#0e141b] flex items-center justify-center pb-1">
          <div className="w-28 h-1 bg-white/40 rounded-full" />
        </div>
      </div>
    </div>
  );
};
