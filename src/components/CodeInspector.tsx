import React, { useState } from 'react';
import {
  FileCode2,
  Copy,
  Check,
  Download,
  FolderTree,
  Layers,
  Sparkles,
  Database,
  Radio,
  FileText,
  Boxes,
  Code2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';
import { ANDROID_PROJECT_FILES, AndroidFile } from '../data/androidSourceCode';

export const CodeInspector: React.FC = () => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(ANDROID_PROJECT_FILES[0].path);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [copyAllStatus, setCopyAllStatus] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const selectedFile =
    ANDROID_PROJECT_FILES.find((f) => f.path === selectedFilePath) || ANDROID_PROJECT_FILES[0];

  const handleCopySingle = (file: AndroidFile) => {
    navigator.clipboard.writeText(file.code);
    setCopiedPath(file.path);
    setTimeout(() => setCopiedPath(null), 2500);
  };

  const handleCopyAll = () => {
    const fullBundle = ANDROID_PROJECT_FILES.map(
      (f) => `// ==========================================\n// FILE: ${f.path}\n// ${f.description}\n// ==========================================\n\n${f.code}\n\n`
    ).join('\n');
    navigator.clipboard.writeText(fullBundle);
    setCopyAllStatus(true);
    setTimeout(() => setCopyAllStatus(false), 2500);
  };

  const getCategoryIcon = (category: AndroidFile['category']) => {
    switch (category) {
      case 'manifest':
        return <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />;
      case 'gradle':
        return <Boxes className="w-3.5 h-3.5 text-blue-400" />;
      case 'room':
        return <Database className="w-3.5 h-3.5 text-emerald-400" />;
      case 'service':
        return <Radio className="w-3.5 h-3.5 text-purple-400" />;
      case 'viewmodel':
        return <Layers className="w-3.5 h-3.5 text-amber-400" />;
      case 'compose':
        return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
      case 'capacitor':
        return <Smartphone className="w-3.5 h-3.5 text-lime-400" />;
      default:
        return <FileCode2 className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const categories = [
    { id: 'all', label: 'All Files', count: ANDROID_PROJECT_FILES.length },
    { id: 'capacitor', label: 'Capacitor APK', count: ANDROID_PROJECT_FILES.filter((f) => f.category === 'capacitor').length },
    { id: 'manifest', label: 'Manifest', count: ANDROID_PROJECT_FILES.filter((f) => f.category === 'manifest').length },
    { id: 'service', label: 'Tracking Service', count: ANDROID_PROJECT_FILES.filter((f) => f.category === 'service').length },
    { id: 'room', label: 'Room DB', count: ANDROID_PROJECT_FILES.filter((f) => f.category === 'room').length },
    { id: 'viewmodel', label: 'ViewModel & Repo', count: ANDROID_PROJECT_FILES.filter((f) => f.category === 'viewmodel').length },
    { id: 'compose', label: 'Jetpack Compose UI', count: ANDROID_PROJECT_FILES.filter((f) => f.category === 'compose').length },
  ];

  const displayedFiles =
    activeCategory === 'all'
      ? ANDROID_PROJECT_FILES
      : ANDROID_PROJECT_FILES.filter((f) => f.category === activeCategory);

  return (
    <div className="h-full flex flex-col bg-[#0e141b] rounded-2xl border border-[#2a475e]/70 overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="bg-[#171d25] px-5 py-3.5 border-b border-[#2a475e]/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#1a9fff]/20 border border-[#1a9fff]/40 flex items-center justify-center">
            <Code2 className="w-4 h-4 text-[#1a9fff]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Android Studio Project Source Code</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1b4021] text-[#a4d007] border border-[#5c7e10]/60 font-mono">
                Kotlin 2.0 + Compose M3
              </span>
            </h2>
            <p className="text-xs text-[#8f98a0]">
              Production-ready copy-pastable files for Android Studio Hedgehog / Iguana / Koala
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleCopyAll}
            className="px-3 py-1.5 bg-[#1b2838] hover:bg-[#222c38] text-[#66c0f4] hover:text-white border border-[#2a475e] hover:border-[#1a9fff] rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow"
          >
            {copyAllStatus ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#a4d007]" />
                <span className="text-[#a4d007]">All Files Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Entire Project</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-5 py-2.5 bg-[#121921] border-b border-[#2a475e]/40 flex items-center space-x-2 overflow-x-auto custom-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-[#1a9fff] text-white shadow-md'
                : 'bg-[#171d25] text-[#8f98a0] hover:text-[#c7d5e0] hover:bg-[#1b2838] border border-[#2a475e]/50'
            }`}
          >
            {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* Main Workspace (File Tree on left, Code Viewer on right) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left File Tree */}
        <div className="w-full md:w-72 bg-[#101720] border-r border-[#2a475e]/60 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="p-3 text-[11px] font-bold uppercase tracking-wider text-[#8f98a0] flex items-center space-x-1.5 border-b border-[#2a475e]/40">
            <FolderTree className="w-3.5 h-3.5 text-[#1a9fff]" />
            <span>Project Explorer</span>
          </div>
          <div className="p-2 space-y-1">
            {displayedFiles.map((file) => {
              const isSelected = file.path === selectedFilePath;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`w-full p-2 rounded-lg text-left transition-all flex items-start space-x-2.5 ${
                    isSelected
                      ? 'bg-[#1b2838] border border-[#1a9fff]/60 text-white shadow-inner'
                      : 'hover:bg-[#171d25] text-[#8f98a0] hover:text-[#c7d5e0] border border-transparent'
                  }`}
                >
                  <span className="mt-0.5 flex-shrink-0">{getCategoryIcon(file.category)}</span>
                  <div className="overflow-hidden flex-1">
                    <p className={`text-xs font-semibold truncate ${isSelected ? 'text-[#66c0f4]' : 'text-gray-200'}`}>
                      {file.name}
                    </p>
                    <p className="text-[10px] text-[#8f98a0] font-mono truncate">{file.path}</p>
                  </div>
                  {isSelected && <ChevronRight className="w-3.5 h-3.5 text-[#1a9fff] flex-shrink-0 mt-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Code Display Area */}
        <div className="flex-1 flex flex-col bg-[#0b1016] overflow-hidden">
          {/* File Meta Header */}
          <div className="px-5 py-3 bg-[#131b24] border-b border-[#2a475e]/50 flex items-center justify-between">
            <div className="overflow-hidden pr-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white font-mono">{selectedFile.path}</span>
                <span className="text-[10px] px-2 py-0.5 bg-[#1b2838] text-[#66c0f4] rounded border border-[#2a475e]">
                  {selectedFile.category.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-[#8f98a0] mt-0.5 truncate">{selectedFile.description}</p>
            </div>

            <button
              onClick={() => handleCopySingle(selectedFile)}
              className="px-3.5 py-1.5 bg-[#1a9fff] hover:bg-[#66c0f4] text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-all shadow flex-shrink-0"
            >
              {copiedPath === selectedFile.path ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy File</span>
                </>
              )}
            </button>
          </div>

          {/* Syntax Highlighted Code Box */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-[#c7d5e0] leading-relaxed custom-scrollbar bg-[#090d12]">
            <pre className="select-text whitespace-pre">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
