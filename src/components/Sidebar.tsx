
import React from 'react';
import { ViewState, GenerationParams } from '../types';
import { MODEL_VARIANTS } from '../constants';
import { 
  LogOut, 
  Home, 
  PlusCircle, 
  Clock, 
  Activity, 
  ChevronLeft, 
  ChevronRight,
  Music,
  Cpu,
  Check,
  CheckCircle2,
  Settings,
  LayoutDashboard
} from 'lucide-react';

interface SidebarProps {
  view: ViewState;
  setView: (view: ViewState) => void;
  params: GenerationParams;
  setParams: (params: GenerationParams) => void;
  currentPreset: string;
  setCurrentPreset: (id: string) => void;
  cacheStats?: { hits: number; misses: number; size: number; count: number; hitRate: string };
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  view, setView, params, setParams, isOpen, onClose, isCollapsed, toggleCollapse, onLogout
}) => {

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'home', label: 'Discover', icon: Home },
    { id: 'generate', label: 'Studio', icon: PlusCircle },
    { id: 'history', label: 'Library', icon: Clock },
    { id: 'test-suite', label: 'Analytics', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
        {isOpen && <div className="fixed inset-0 bg-black/70 z-[60] md:hidden backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>}

        <aside className={`fixed top-0 bottom-0 left-0 z-[70] bg-white dark:bg-black text-gray-600 dark:text-gray-400 flex flex-col transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-800/50 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64`}>
            <div className={`px-6 py-8 flex items-center shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                <div className="flex items-center gap-3">
                    <div className="bg-pink-500 w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                        <Music size={18} strokeWidth={3} />
                    </div>
                    {!isCollapsed && <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white uppercase italic">MELODAI</span>}
                </div>
                <button onClick={toggleCollapse} className="hidden md:flex p-1.5 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors text-gray-400 hover:text-pink-500">
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
                <div className={`${isCollapsed ? 'px-2 text-center' : 'px-3'} mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest`}>
                    {!isCollapsed ? 'Main Menu' : '...'}
                </div>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => { setView(item.id as ViewState); if (isOpen) onClose(); }}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-sm group ${
                            view === item.id 
                                ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/30'
                        } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    >
                        <item.icon size={20} className={`shrink-0 transition-colors ${view === item.id ? 'text-pink-500' : 'group-hover:text-pink-500'}`} />
                        {!isCollapsed && <span>{item.label}</span>}
                    </button>
                ))}

                <div className="mt-8 px-3 space-y-3">
                    <div className={`${isCollapsed ? 'px-2 text-center' : 'px-1'} mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2`}>
                        <Cpu size={12} className="text-pink-500" /> {!isCollapsed && 'Engine Selection'}
                    </div>
                    
                    <div className="space-y-2">
                        {MODEL_VARIANTS.slice(0, isCollapsed ? 1 : 3).map((model) => (
                            <button
                                key={model.id}
                                onClick={() => setParams({ ...params, modelVariant: model.id })}
                                className={`w-full text-left px-4 py-2.5 rounded-2xl border transition-all flex flex-col group/model ${
                                    params.modelVariant === model.id
                                    ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/20'
                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 hover:border-pink-500/50'
                                } ${isCollapsed ? 'items-center justify-center p-2' : ''}`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    {!isCollapsed ? (
                                        <span className={`text-[11px] font-black uppercase tracking-wider ${params.modelVariant === model.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{model.name.split(' ')[1]}</span>
                                    ) : (
                                        <Cpu size={16} />
                                    )}
                                    {!isCollapsed && params.modelVariant === model.id && <Check size={14} className="text-white" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            <div className="shrink-0 border-t border-gray-200 dark:border-gray-800/50 p-4 bg-white dark:bg-black">
                <button 
                    onClick={onLogout}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                    <LogOut size={20} className="shrink-0 rotate-180" />
                    {!isCollapsed && <span>Log out</span>}
                </button>
            </div>
        </aside>
    </>
  );
};

export default Sidebar;
