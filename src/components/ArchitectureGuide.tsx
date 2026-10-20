import React from 'react';
import {
  ShieldAlert,
  Cpu,
  Database,
  Radio,
  Clock,
  Sparkles,
  Terminal,
  Layers,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 text-left custom-scrollbar text-[#c7d5e0]">
      {/* Overview Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#171d25] via-[#1b2838] to-[#101822] border border-[#2a475e] shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#1a9fff]/20 border border-[#1a9fff]/40 flex items-center justify-center text-[#1a9fff]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-wide">
              SteamWise Architecture & Engine Deep-Dive
            </h2>
            <p className="text-xs text-[#8f98a0]">
              How real-time foreground game tracking operates reliably on Android 14+ (API 34/35)
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Key Technical Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Permission Mechanics */}
        <div className="p-4 bg-[#171d25] rounded-xl border border-[#2a475e]/70 space-y-2.5">
          <div className="flex items-center space-x-2 text-[#ff9800]">
            <ShieldAlert className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">1. PACKAGE_USAGE_STATS & AppOps</h3>
          </div>
          <p className="text-xs text-[#8f98a0] leading-relaxed">
            Unlike standard dangerous runtime permissions (e.g. Camera or Location), <code className="text-[#66c0f4]">PACKAGE_USAGE_STATS</code> is a protected system permission. It cannot be granted via standard request permission dialogs; it requires guiding the user into Android Settings via:
          </p>
          <div className="bg-[#0e141b] p-2.5 rounded-lg font-mono text-[11px] text-[#a4d007] border border-[#2a475e]/40">
            Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
          </div>
          <p className="text-xs text-[#8f98a0]">
            Permission verification must be conducted with <code className="text-[#66c0f4]">AppOpsManager.unsafeCheckOpNoThrow()</code>, checking for <code className="text-[#a4d007]">AppOpsManager.MODE_ALLOWED</code>.
          </p>
        </div>

        {/* Foreground Service vs WorkManager */}
        <div className="p-4 bg-[#171d25] rounded-xl border border-[#2a475e]/70 space-y-2.5">
          <div className="flex items-center space-x-2 text-[#1a9fff]">
            <Cpu className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">2. Foreground Service Polling</h3>
          </div>
          <p className="text-xs text-[#8f98a0] leading-relaxed">
            While <code className="text-[#66c0f4]">WorkManager</code> is ideal for deferred batch tasks (minimum 15-minute interval), a gaming tracker requires immediate second-level accuracy when a game is launched or closed.
          </p>
          <ul className="text-xs text-[#8f98a0] space-y-1 list-disc list-inside">
            <li>Foreground Service displays an ongoing notification to avoid Android OS killer termination.</li>
            <li>Runs a 2-second coroutine polling interval balance between millisecond precision and battery conservation.</li>
            <li>Android 14+ compliant with <code className="text-[#66c0f4]">specialUse</code> service type.</li>
          </ul>
        </div>

        {/* UsageStats Detection Algorithm */}
        <div className="p-4 bg-[#171d25] rounded-xl border border-[#2a475e]/70 space-y-2.5">
          <div className="flex items-center space-x-2 text-[#a4d007]">
            <Clock className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">3. Active App Detection Algorithm</h3>
          </div>
          <p className="text-xs text-[#8f98a0] leading-relaxed">
            The service invokes <code className="text-[#66c0f4]">UsageStatsManager.queryEvents()</code> over a rolling 10-second window:
          </p>
          <div className="bg-[#0e141b] p-2.5 rounded-lg font-mono text-[11px] text-[#66c0f4] border border-[#2a475e]/40 space-y-1">
            <div>event.eventType == ACTIVITY_RESUMED // 1</div>
            <div>event.eventType == ACTIVITY_PAUSED // 2</div>
          </div>
          <p className="text-xs text-[#8f98a0]">
            The most recent RESUMED event determines the active foreground package. If the package matches a game stored in Room, elapsed seconds accumulate.
          </p>
        </div>

        {/* Room Database Thread Safety */}
        <div className="p-4 bg-[#171d25] rounded-xl border border-[#2a475e]/70 space-y-2.5">
          <div className="flex items-center space-x-2 text-[#c084fc]">
            <Database className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">4. Atomic Room Playtime Updates</h3>
          </div>
          <p className="text-xs text-[#8f98a0] leading-relaxed">
            To prevent read-modify-write race conditions between the foreground service thread and the Compose UI, the DAO features an atomic SQL update query:
          </p>
          <div className="bg-[#0e141b] p-2.5 rounded-lg font-mono text-[11px] text-[#c084fc] border border-[#2a475e]/40">
            UPDATE games SET totalPlaytimeSeconds = totalPlaytimeSeconds + :seconds WHERE packageName = :pkg
          </div>
          <p className="text-xs text-[#8f98a0]">
            Room provides a reactive <code className="text-[#66c0f4]">Flow&lt;List&lt;GameEntity&gt;&gt;</code> directly to the ViewModel StateFlow.
          </p>
        </div>
      </div>

      {/* Android Studio Setup Step-by-Step */}
      <div className="p-5 bg-[#171d25] rounded-2xl border border-[#2a475e] space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-[#1a9fff]" />
          <span>Quick Setup Guide in Android Studio</span>
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-start space-x-2.5">
            <span className="w-5 h-5 rounded-full bg-[#1b2838] border border-[#1a9fff] flex items-center justify-center text-[10px] font-bold text-[#66c0f4] flex-shrink-0 mt-0.5">
              1
            </span>
            <p>
              Open Android Studio and choose <strong className="text-white">New Project &gt; Empty Activity (Compose)</strong>. Set package name to <code className="text-[#66c0f4]">com.steamwise.tracker</code>.
            </p>
          </div>

          <div className="flex items-start space-x-2.5">
            <span className="w-5 h-5 rounded-full bg-[#1b2838] border border-[#1a9fff] flex items-center justify-center text-[10px] font-bold text-[#66c0f4] flex-shrink-0 mt-0.5">
              2
            </span>
            <p>
              Copy the <code className="text-[#66c0f4]">app/build.gradle.kts</code> dependencies (Room with KSP, Coil, Lifecycle) and click <strong className="text-white">Sync Now</strong>.
            </p>
          </div>

          <div className="flex items-start space-x-2.5">
            <span className="w-5 h-5 rounded-full bg-[#1b2838] border border-[#1a9fff] flex items-center justify-center text-[10px] font-bold text-[#66c0f4] flex-shrink-0 mt-0.5">
              3
            </span>
            <p>
              Replace <code className="text-[#66c0f4]">AndroidManifest.xml</code> with the provided manifest file containing <code className="text-[#a4d007]">PACKAGE_USAGE_STATS</code> and the service declaration.
            </p>
          </div>

          <div className="flex items-start space-x-2.5">
            <span className="w-5 h-5 rounded-full bg-[#1b2838] border border-[#1a9fff] flex items-center justify-center text-[10px] font-bold text-[#66c0f4] flex-shrink-0 mt-0.5">
              4
            </span>
            <p>
              Paste the Kotlin classes into their matching packages (<code className="text-[#66c0f4]">data/local</code>, <code className="text-[#66c0f4]">service</code>, <code className="text-[#66c0f4]">ui/screens</code>, <code className="text-[#66c0f4]">ui/theme</code>).
            </p>
          </div>

          <div className="flex items-start space-x-2.5">
            <span className="w-5 h-5 rounded-full bg-[#1b2838] border border-[#1a9fff] flex items-center justify-center text-[10px] font-bold text-[#66c0f4] flex-shrink-0 mt-0.5">
              5
            </span>
            <p>
              Build and Run on your Android device or emulator. Click <strong className="text-white">Grant</strong> to authorize Usage Access in Android Settings, then pick games with the FAB!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
