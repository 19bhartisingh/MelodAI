
import React, { useState } from 'react';
import { Sparkles, Music, Play, Layers, Zap, Clock, Mail, Lock, User as UserIcon, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService.ts';
import { User } from '../types.ts';

interface LandingPageProps {
  onLogin: (user: User) => void;
}

type AuthView = 'landing' | 'login' | 'signup';

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('landing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let user: User;
      if (view === 'login') {
        user = await authService.login(email, password);
      } else {
        user = await authService.signup(email, password, name);
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    const guestUser: User = {
      id: 'guest',
      email: 'guest@musegen.ai',
      name: 'Guest Producer',
      createdAt: new Date()
    };
    onLogin(guestUser);
  };

  if (view === 'landing') {
    return (
      <div className="relative z-10 text-white selection:bg-green-500 selection:text-black min-h-screen flex flex-col">
        {/* Header */}
        <nav className="flex items-center justify-between px-6 py-4 md:px-12 md:py-8">
          <div className="flex items-center gap-2">
            <Music className="text-green-500 w-8 h-8" strokeWidth={2.5} />
            <span className="text-2xl font-black tracking-tighter">MELODAI</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('login')}
              className="text-white font-bold px-4 py-2 hover:text-green-500 transition-colors"
            >
              Log in
            </button>
            <button 
              onClick={() => setView('signup')}
              className="bg-white text-black font-bold px-6 py-2 rounded-full hover:scale-105 transition-transform"
            >
              Sign up
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gray-800/50 backdrop-blur-md border border-gray-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-green-400 mb-8 animate-bounce-slow">
            <Sparkles size={14} /> The Future of Sound is Here
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
            Music for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Every Prompt.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl leading-relaxed">
            The AI that generates professional scores and high-fidelity loops in seconds. Just type what you feel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setView('signup')}
              className="bg-green-500 text-black text-xl font-bold px-12 py-5 rounded-full shadow-2xl shadow-green-500/20 hover:scale-105 transition-transform flex items-center gap-3"
            >
              <Play fill="black" /> Get Started Free
            </button>
            <button 
              onClick={handleGuestAccess}
              className="bg-gray-900/50 text-white text-xl font-bold px-12 py-5 rounded-full border border-gray-700 hover:bg-gray-800/50 transition-colors"
            >
              Try Guest Access
            </button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 py-20 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <FeatureCard 
            Icon={Zap} 
            title="Instant Generation" 
            description="High-speed synthesis engine delivers your music in 20-30 seconds, not minutes."
          />
          <FeatureCard 
            Icon={Layers} 
            title="Multi-Stem Control" 
            description="Separate scores for melody, bass, and harmony generated uniquely for every track."
          />
          <FeatureCard 
            Icon={Clock} 
            title="Zero Latency" 
            description="Powered by Gemini Flash for immediate creative feedback without the wait."
          />
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-gray-800/50 py-12 px-6 text-center text-gray-500 text-sm">
          <p>© 2025 MELOD AI.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        <div className="bg-black/60 backdrop-blur-2xl border border-gray-800 rounded-3xl p-8 shadow-2xl">
          <button 
            onClick={() => setView('landing')}
            className="text-gray-400 hover:text-white mb-8 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowRight className="rotate-180 w-4 h-4" /> Back to home
          </button>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-2">
              {view === 'login' ? 'Welcome Back' : 'Join MelodAI'}
            </h2>
            <p className="text-gray-400">
              {view === 'login' 
                ? 'Sign in to continue your musical journey.' 
                : 'Create an account to save your tracks and stats.'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertCircle className="shrink-0 w-4 h-4" />
                {error}
              </div>
            )}

            {view === 'signup' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Composer Name"
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-black font-bold py-4 rounded-2xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (view === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-sm">
              {view === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(null); }}
                className="text-green-500 font-bold ml-1 hover:underline"
              >
                {view === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </p>
            <button 
              onClick={handleGuestAccess}
              className="text-gray-500 text-xs mt-4 hover:text-white transition-colors"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ Icon, title, description }: { Icon: any, title: string, description: string }) => (
  <div className="bg-[#181818]/60 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl group hover:border-green-500/50 transition-colors">
    <div className="bg-green-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-green-500 mb-6 group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;
