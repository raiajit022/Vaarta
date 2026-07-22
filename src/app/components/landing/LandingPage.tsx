import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Video, Users, Monitor, Film, Shield, Smartphone,
  Menu, X, Check, ArrowRight, Play, Star, ChevronRight,
  Mic, MicOff, VideoOff, PhoneOff, MessageSquare, MoreHorizontal
} from 'lucide-react';

const VaartaLogo = () => (
  <div className="flex items-center gap-2">
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#34d399] to-[#059669] shadow-sm">
      <Video className="w-4 h-4 text-white" />
    </div>
    <span className="font-semibold text-lg tracking-tight">Vaarta</span>
  </div>
);

interface LandingPageProps {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  onSignIn: () => void;
  onGetStarted: () => void;
}

export function LandingPage({ isDark, setIsDark, onSignIn, onGetStarted }: LandingPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`min-h-screen font-sans ${isDark ? 'dark bg-[#14120F] text-[#faf9f7]' : 'bg-[#faf9f7] text-[#14120F]'} transition-colors duration-300`}>
      
      {/* Navigation */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? (isDark ? 'bg-[#14120F]/90 backdrop-blur-md border-b border-stone-800/80' : 'bg-[#faf9f7]/90 backdrop-blur-md border-b border-stone-200/80') : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <VaartaLogo />
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#product" className="text-sm font-medium hover:text-[#059669] transition-colors">Product</a>
              <a href="#features" className="text-sm font-medium hover:text-[#059669] transition-colors">Features</a>
              <a href="#about" className="text-sm font-medium hover:text-[#059669] transition-colors">About</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-stone-800 text-stone-300' : 'hover:bg-stone-200 text-stone-600'}`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={onSignIn} className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${isDark ? 'hover:bg-stone-800' : 'hover:bg-stone-200'}`}>
                Sign In
              </button>
              <button onClick={onGetStarted} className="text-sm font-medium px-4 py-2 rounded-md text-white bg-gradient-to-r from-[#34d399] to-[#059669] hover:opacity-90 transition-opacity shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <button 
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-lg ${isDark ? 'text-stone-300' : 'text-stone-600'}`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-b ${isDark ? 'bg-[#14120F] border-stone-800' : 'bg-[#faf9f7] border-stone-200'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#product" className="block px-3 py-2 text-base font-medium">Product</a>
              <a href="#features" className="block px-3 py-2 text-base font-medium">Features</a>
              <a href="#about" className="block px-3 py-2 text-base font-medium">About</a>
              <div className="mt-4 pt-4 border-t border-stone-200/20 px-3 space-y-2">
                <button onClick={onSignIn} className="w-full text-left px-3 py-2 text-base font-medium">Sign In</button>
                <button onClick={onGetStarted} className="w-full text-center px-4 py-3 rounded-md text-white bg-gradient-to-r from-[#34d399] to-[#059669]">Get Started</button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#34d399] rounded-full blur-[120px] opacity-[0.05] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            Meetings that feel like <br className="hidden sm:block" /> being in the same room.
          </h1>
          <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
            Enterprise-grade video conferencing built for clarity, security, and seamless collaboration. Connect your entire team with zero friction.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button onClick={onGetStarted} className="w-full sm:w-auto text-base font-medium px-6 py-3 rounded-md text-white bg-gradient-to-r from-[#34d399] to-[#059669] hover:opacity-90 transition-opacity shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              Get Started Free
            </button>
            <button className={`w-full sm:w-auto text-base font-medium px-6 py-3 rounded-md border flex items-center justify-center gap-2 transition-colors ${isDark ? 'border-stone-700 hover:bg-stone-800' : 'border-stone-300 hover:bg-stone-200'}`}>
              <Play className="w-4 h-4" /> Watch Demo
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-stone-500 mb-16">
            <div className="flex text-[#34d399]">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <span>Trusted by forward-thinking teams</span>
          </div>

          {/* Hero Visual Mockup */}
          <div className={`relative mx-auto max-w-5xl rounded-2xl overflow-hidden border shadow-2xl ${isDark ? 'border-stone-800 bg-[#1A1712]' : 'border-stone-200 bg-white'}`}>
            <div className={`h-10 border-b flex items-center px-4 gap-2 ${isDark ? 'border-stone-800 bg-[#14120F]' : 'border-stone-200 bg-[#faf9f7]'}`}>
              <div className="w-3 h-3 rounded-full bg-stone-300 dark:bg-stone-700" />
              <div className="w-3 h-3 rounded-full bg-stone-300 dark:bg-stone-700" />
              <div className="w-3 h-3 rounded-full bg-stone-300 dark:bg-stone-700" />
            </div>
            <div className="aspect-[16/9] bg-stone-900 relative flex items-center justify-center">
              {/* Abstract Geometric Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#34d399]/10 via-transparent to-transparent opacity-50 pointer-events-none z-20" />
              <div className="grid grid-cols-3 grid-rows-2 gap-3 w-full h-full p-3 pb-16">
                {/* Main speaker */}
                <div className="col-span-2 row-span-2 rounded-xl bg-stone-800 border border-[#34d399]/40 relative overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1758598304200-f89a1d8ebedb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Sarah Jenkins on a video call" className="w-full h-full object-cover" />
                   <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-[#34d399] text-stone-900 text-[10px] font-medium rounded-md">
                     <span className="w-1.5 h-1.5 rounded-full bg-stone-900 animate-pulse" /> Speaking
                   </div>
                   <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur text-white text-xs rounded-md">
                     <Mic className="w-3 h-3" /> Sarah Jenkins
                   </div>
                </div>
                {/* David */}
                <div className="rounded-xl bg-stone-800 border border-stone-700/50 relative overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1758598497528-d8d9b3f22894?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800" alt="David W. on a video call" className="w-full h-full object-cover" />
                   <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur text-white text-[10px] rounded-md">
                     <MicOff className="w-2.5 h-2.5 text-red-400" /> David W.
                   </div>
                </div>
                {/* Elena */}
                <div className="rounded-xl bg-stone-800 border border-stone-700/50 relative overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1758874384555-de68b8035c24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800" alt="Elena R. on a video call" className="w-full h-full object-cover" />
                   <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur text-white text-[10px] rounded-md">
                     <Mic className="w-2.5 h-2.5" /> Elena R.
                   </div>
                </div>
              </div>
              {/* Conference control bar */}
              <div className="absolute bottom-0 left-0 right-0 h-14 bg-stone-950/80 backdrop-blur border-t border-white/10 flex items-center justify-center gap-3 z-30">
                <button className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors" title="Mute">
                  <Mic className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors" title="Stop video">
                  <Video className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors" title="Share screen">
                  <Monitor className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors" title="Chat">
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors" title="More">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <button className="h-9 px-4 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-1.5 text-xs font-medium transition-colors" title="Leave">
                  <PhoneOff className="w-4 h-4" /> Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className={`py-10 border-y ${isDark ? 'border-stone-800/80 bg-[#1A1712]/30' : 'border-stone-200/80 bg-white/30'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-stone-500 mb-6 uppercase tracking-wider">Trusted by teams worldwide</p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-40 grayscale">
            {['Acme Corp', 'GlobalTech', 'Nexus', 'Horizon', 'Vanguard'].map((name, i) => (
              <div key={i} className="text-xl font-bold tracking-tight text-stone-800 dark:text-stone-300">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-medium tracking-tight mb-4">Everything you need for flawless meetings</h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
              Built for performance and reliability from the ground up.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Video, title: 'HD Video & Audio', desc: 'Crystal clear calls at any scale, optimized for low bandwidth.' },
              { icon: Shield, title: 'Smart Waiting Rooms', desc: 'Control who joins and when, with robust access management.' },
              { icon: Monitor, title: 'Screen Sharing', desc: 'Presentations without friction. Share tabs, windows or full screens.' },
              { icon: Film, title: 'Meeting Recordings', desc: 'Never miss a moment. Cloud recording with auto-transcription.' },
              { icon: Users, title: 'Enterprise Security', desc: 'End-to-end encryption, SSO-ready and SOC2 compliant.' },
              { icon: Smartphone, title: 'Cross-Platform', desc: 'Desktop, mobile, browser, all in sync perfectly.' },
            ].map((feat, i) => (
              <div key={i} className={`p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${isDark ? 'bg-[#1A1712] border-stone-800/80 hover:border-stone-700' : 'bg-white border-stone-200/80 hover:shadow-lg'}`}>
                <div className="w-10 h-10 rounded-lg bg-[#34d399]/10 flex items-center justify-center mb-4">
                  <feat.icon className="w-5 h-5 text-[#059669] dark:text-[#34d399]" />
                </div>
                <h3 className="text-lg font-medium mb-2">{feat.title}</h3>
                <p className={`text-sm ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={`py-24 ${isDark ? 'bg-[#1A1712]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-medium tracking-tight mb-4">How it works</h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
              Start collaborating in seconds, not minutes.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-px bg-stone-200 dark:bg-stone-800" />
            
            <div className="grid md:grid-cols-3 gap-12 relative z-10">
              {[
                { step: '1', title: 'Create a meeting', desc: 'Generate a secure link instantly.' },
                { step: '2', title: 'Invite your team', desc: 'Share the link via email or Slack.' },
                { step: '3', title: 'Start collaborating', desc: 'Join from any device, no downloads.' },
              ].map((item, i) => (
                <div key={i} className="text-center relative">
                  <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center font-medium text-lg mb-6 border-2 ${isDark ? 'bg-[#14120F] border-[#059669] text-[#34d399]' : 'bg-[#faf9f7] border-[#34d399] text-[#059669]'}`}>
                    {item.step}
                  </div>
                  <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                  <p className={`text-sm ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <h2 className="text-3xl font-medium tracking-tight mb-12">Intelligent interface, out of your way</h2>
           <div className={`relative mx-auto max-w-4xl rounded-2xl overflow-hidden border shadow-xl ${isDark ? 'border-stone-800 bg-[#1A1712]' : 'border-stone-200 bg-white'}`}>
             <div className={`h-8 border-b flex items-center px-4 gap-2 ${isDark ? 'border-stone-800 bg-[#14120F]' : 'border-stone-200 bg-[#faf9f7]'}`}>
                <div className="w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-stone-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-stone-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-stone-700" />
             </div>
             <div className="aspect-video bg-stone-100 dark:bg-stone-900 flex flex-col p-2 gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                   <div className="bg-stone-200 dark:bg-stone-800 rounded-lg relative overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1758598306845-8630d064a244?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="You" className="w-full h-full object-cover" />
                      <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur">You</div>
                   </div>
                   <div className="bg-stone-300 dark:bg-stone-700 rounded-lg relative overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1758518732151-d43b17303c79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Alex Chen" className="w-full h-full object-cover" />
                      <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur">Alex Chen</div>
                   </div>
                </div>
                <div className={`h-14 rounded-lg flex items-center justify-center gap-4 ${isDark ? 'bg-stone-800' : 'bg-white shadow-sm'}`}>
                   <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center"><Video className="w-4 h-4" /></div>
                   <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center"><Monitor className="w-4 h-4" /></div>
                   <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center"><X className="w-4 h-4" /></div>
                </div>
             </div>
           </div>
           <p className={`mt-6 text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Focus on the conversation, not the controls.</p>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`py-24 ${isDark ? 'bg-[#1A1712]' : 'bg-white'}`}>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-medium tracking-tight mb-16 text-center">Loved by teams</h2>
            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { quote: "Vaarta transformed how our remote team communicates. The clarity is unmatched and the UI is beautiful.", name: "Sarah J.", role: "VP Engineering, Nexus" },
                 { quote: "Finally, a video tool that doesn't feel bloated. It's fast, secure, and our clients love the waiting room feature.", name: "Mark T.", role: "Founder, Horizon Media" },
                 { quote: "We switched from the industry giant and haven't looked back. The enterprise security features made it an easy choice.", name: "Elena R.", role: "CTO, GlobalTech" }
               ].map((t, i) => (
                 <div key={i} className={`p-8 rounded-2xl border ${isDark ? 'bg-[#14120F] border-stone-800' : 'bg-[#faf9f7] border-stone-200'}`}>
                   <p className="text-base leading-relaxed mb-8">"{t.quote}"</p>
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-stone-300 dark:bg-stone-700 flex items-center justify-center text-sm font-medium">
                       {t.name.split(' ').map(n=>n[0]).join('')}
                     </div>
                     <div>
                       <div className="text-sm font-medium">{t.name}</div>
                       <div className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{t.role}</div>
                     </div>
                   </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Final CTA */}
      <section className={`py-24 relative overflow-hidden ${isDark ? 'bg-[#34d399]/5' : 'bg-[#34d399]/10'}`}>
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-6">Ready to upgrade your meetings?</h2>
            <button onClick={onGetStarted} className="text-base font-medium px-8 py-4 rounded-md text-white bg-gradient-to-r from-[#34d399] to-[#059669] hover:opacity-90 transition-opacity shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] mb-4">
              Get Started for Free
            </button>
            <p className="text-sm text-stone-500">No credit card required. Setup in minutes.</p>
         </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 border-t ${isDark ? 'border-stone-800 bg-[#14120F]' : 'border-stone-200 bg-[#faf9f7]'}`}>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
               <div className="col-span-2">
                  <div className="mb-4"><VaartaLogo /></div>
                  <p className={`text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'} max-w-xs`}>
                    Enterprise-grade video conferencing built for clarity, security, and seamless collaboration.
                  </p>
               </div>
               <div>
                  <h4 className="font-medium mb-4 text-sm">Product</h4>
                  <ul className={`space-y-3 text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                     <li><a href="#" className="hover:text-[#059669]">Features</a></li>
                     <li><a href="#" className="hover:text-[#059669]">Integrations</a></li>
                     <li><a href="#" className="hover:text-[#059669]">Changelog</a></li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-medium mb-4 text-sm">Company</h4>
                  <ul className={`space-y-3 text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                     <li><a href="#" className="hover:text-[#059669]">About Us</a></li>
                     <li><a href="#" className="hover:text-[#059669]">Careers</a></li>
                     <li><a href="#" className="hover:text-[#059669]">Blog</a></li>
                     <li><a href="#" className="hover:text-[#059669]">Contact</a></li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-medium mb-4 text-sm">Legal</h4>
                  <ul className={`space-y-3 text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                     <li><a href="#" className="hover:text-[#059669]">Privacy Policy</a></li>
                     <li><a href="#" className="hover:text-[#059669]">Terms of Service</a></li>
                     <li><a href="#" className="hover:text-[#059669]">Security</a></li>
                  </ul>
               </div>
            </div>
            <div className={`pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 ${isDark ? 'border-stone-800' : 'border-stone-200'}`}>
               <p className={`text-sm ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>© {new Date().getFullYear()} Vaarta Inc. All rights reserved.</p>
               <div className="flex gap-4">
                  {/* Social placeholders */}
                  <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800" />
                  <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800" />
                  <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800" />
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
