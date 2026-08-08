import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sun, Moon, Menu, X, ArrowRight, Sparkles, Shield, Monitor, Film,
  Smartphone, Video, Users, Mic, MicOff, MessageSquare, PhoneOff,
  MoreHorizontal, ListChecks, Gauge, Lock, Zap,
} from 'lucide-react';
import { Logo, VaartaMark } from '../../ui/Logo';
import { Button } from '../../ui/Button';
import { cn } from '../../ui/cn';

interface LandingPageProps {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  onSignIn: () => void;
  onGetStarted: () => void;
}

/** Shared scroll-reveal. Subtle on purpose — motion should be felt, not watched. */
const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: 'easeOut' as const },
};

/* -------------------------------------------------------------------------- */
/*  Product mock — built entirely from tokens.                                 */
/*  Replaces the stock photography, which dated the page and shipped four      */
/*  external image requests before the hero could paint.                       */
/* -------------------------------------------------------------------------- */

function PresenceTile({
  name,
  speaking,
  muted,
  className,
  large,
}: {
  name: string;
  speaking?: boolean;
  muted?: boolean;
  className?: string;
  large?: boolean;
}) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden bg-surface-inset border border-line',
        speaking && 'border-transparent shadow-[0_0_0_2px_var(--iris),0_0_36px_-8px_var(--iris-glow)]',
        className
      )}
    >
      {/* Abstract "portrait": a soft presence field rather than a stock face */}
      <div
        className="absolute inset-0"
        style={{
          background: speaking
            ? 'radial-gradient(120% 90% at 50% 25%, var(--iris-soft), transparent 62%)'
            : 'radial-gradient(120% 90% at 50% 25%, var(--saffron-soft), transparent 62%)',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            'font-semibold text-ink opacity-[0.13] select-none',
            large ? 'text-[9rem]' : 'text-[3.5rem]'
          )}
        >
          {initial}
        </span>
      </div>

      {speaking && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-iris text-on-iris t-caption font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-breathe" />
          Speaking
        </div>
      )}

      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--scrim)] backdrop-blur-md text-ink t-caption">
        {muted ? <MicOff className="w-3 h-3 text-danger-ink" /> : <Mic className="w-3 h-3" />}
        {name}
      </div>
    </div>
  );
}

function ProductMock() {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-line bg-canvas-raised elev-4">
      {/* Window chrome */}
      <div className="h-10 border-b border-line bg-surface flex items-center px-4 gap-2">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
          <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
          <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-3 py-1 rounded-md bg-surface-inset border border-line t-caption text-ink-3 font-mono">
            vaarta.app/join/QX7-4KP
          </div>
        </div>
      </div>

      {/* Stage */}
      <div className="relative aspect-[16/10] bg-canvas p-3 pb-[68px]">
        <div className="grid grid-cols-3 grid-rows-2 gap-3 h-full">
          <PresenceTile name="Ananya" speaking large className="col-span-2 row-span-2" />
          <PresenceTile name="Dev" muted />
          <PresenceTile name="Meera" />
        </div>

        {/* Control bar — the real one, at rest */}
        <div className="absolute bottom-0 inset-x-0 h-[68px] border-t border-line bg-[var(--scrim)] backdrop-blur-xl flex items-center justify-center gap-2">
          {[Mic, Video, Monitor, MessageSquare, MoreHorizontal].map((Icon, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-lg bg-surface border border-line flex items-center justify-center text-ink-2"
            >
              <Icon className="w-4 h-4" />
            </div>
          ))}
          <div className="h-10 px-4 rounded-full bg-danger text-white flex items-center gap-1.5 t-small font-medium ml-1">
            <PhoneOff className="w-4 h-4" /> Leave
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small local icon so the capability strip doesn't pull another lucide import. */
function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */

export function LandingPage({ isDark, setIsDark, onSignIn, onGetStarted }: LandingPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#product', label: 'Product' },
    { href: '#intelligence', label: 'Intelligence' },
    { href: '#how', label: 'How it works' },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans antialiased overflow-x-hidden">
      {/* ------------------------------- Nav ------------------------------- */}
      <nav className="fixed top-0 inset-x-0 z-50 px-4 pt-3">
        <div
          className={cn(
            'mx-auto flex items-center justify-between transition-all duration-300 ease-out',
            isScrolled
              ? 'max-w-4xl h-14 px-4 rounded-2xl border border-line bg-[var(--scrim)] backdrop-blur-xl elev-2'
              : 'max-w-7xl h-16 px-2 border border-transparent'
          )}
        >
          <Logo size="sm" />

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3 py-1.5 rounded-md t-small font-medium text-ink-2 hover:text-ink hover:bg-surface-hover transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="iconSm"
              onClick={() => setIsDark(!isDark)}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onSignIn}>
              Sign in
            </Button>
            <Button size="sm" onClick={onGetStarted}>
              Get started
            </Button>
          </div>

          <div className="md:hidden flex items-center gap-1">
            <Button variant="ghost" size="iconSm" onClick={() => setIsDark(!isDark)} aria-label="Toggle theme">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="iconSm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mx-auto mt-2 max-w-7xl rounded-2xl border border-line bg-surface elev-3 p-3">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-md t-body text-ink-2 hover:bg-surface-hover hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 pt-3 border-t border-line flex flex-col gap-2">
              <Button variant="outline" onClick={onSignIn}>Sign in</Button>
              <Button onClick={onGetStarted}>Get started</Button>
            </div>
          </div>
        )}
      </nav>

      {/* ------------------------------ Hero ------------------------------- */}
      <section className="relative pt-36 pb-20 lg:pt-48 lg:pb-28">
        {/* Atmosphere */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="aurora aurora-iris w-[820px] h-[820px] -top-64 left-1/2 -translate-x-2/3 opacity-[0.22] animate-drift" />
          <div
            className="aurora aurora-saffron w-[560px] h-[560px] -top-20 right-0 opacity-[0.12] animate-drift"
            style={{ animationDelay: '-6s' }}
          />
          <div
            className="absolute inset-0 grid-field opacity-40"
            style={{ maskImage: 'radial-gradient(ellipse 80% 55% at 50% 0%, #000 30%, transparent 78%)' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center"
          >
            <a
              href="#intelligence"
              className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 mb-8 rounded-full border border-iris-line bg-iris-soft t-small font-medium text-iris hover:bg-surface-hover transition-colors"
            >
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-iris text-on-iris t-caption">
                <Sparkles className="w-3 h-3" /> New
              </span>
              Summaries, action items and sentiment — built in
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <h1 className="t-display max-w-4xl mx-auto text-balance">
              Meetings that feel like{' '}
              <em className="italic text-iris">being in the same room.</em>
            </h1>

            <p className="t-body sm:text-[17px] text-ink-2 max-w-xl mx-auto mt-6 leading-relaxed">
              Vaarta is video conferencing without the drag — instant rooms, guest links that
              just work, and an assistant that writes the notes so nobody has to.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-9">
              <Button size="lg" onClick={onGetStarted} trailing={<ArrowRight className="w-4 h-4" />}>
                Start for free
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  document.getElementById('product')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                See it in action
              </Button>
            </div>

            <p className="t-caption text-ink-3 mt-5">
              No credit card. No download. Guests join straight from the browser.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="relative mt-16 max-w-5xl mx-auto"
            id="product"
          >
            <div className="absolute -inset-x-16 -top-8 -bottom-16 aurora aurora-iris opacity-[0.16] blur-[100px] rounded-full" aria-hidden="true" />
            <div className="relative">
              <ProductMock />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --------------------------- Capabilities -------------------------- */}
      <section className="border-y border-line bg-canvas-raised">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Lock, label: 'Encrypted in transit', sub: 'DTLS-SRTP media' },
              { icon: Zap, label: 'Sub-second latency', sub: 'Global SFU routing' },
              { icon: GlobeIcon, label: 'Nothing to install', sub: 'Works in the browser' },
              { icon: Sparkles, label: 'AI notes included', sub: 'On every meeting' },
            ].map((item, i) => (
              <motion.div key={i} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-iris-soft border border-iris-line flex items-center justify-center text-iris shrink-0">
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="t-small font-medium text-ink truncate">{item.label}</p>
                  <p className="t-caption text-ink-3 truncate">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- Intelligence ------------------------- */}
      <section id="intelligence" className="relative py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...reveal} className="max-w-2xl">
            <p className="t-overline text-iris mb-4">Intelligence</p>
            <h2 className="t-display-sm text-balance">
              An assistant that actually <em className="italic text-iris">sat through</em> the meeting.
            </h2>
            <p className="t-body text-ink-2 mt-5 leading-relaxed">
              Type <code className="font-mono text-iris bg-iris-soft px-1.5 py-0.5 rounded">@bot</code> in
              the chat and ask anything. When the call ends, Vaarta writes the recap, pulls out who
              owes what, and tells you how the room actually felt.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-5 mt-14">
            {[
              {
                icon: Film,
                title: 'Summary',
                body: 'A tight recap of what was decided — not a transcript dump.',
                sample: 'Team aligned on shipping the billing rewrite by Q3. Pricing page copy still blocked on legal review.',
                items: null as { task: string; owner: string }[] | null,
                badge: null as string | null,
              },
              {
                icon: ListChecks,
                title: 'Action items',
                body: 'Every commitment, with an owner attached.',
                sample: null,
                items: [
                  { task: 'Send revised pricing draft', owner: 'Ananya' },
                  { task: 'Unblock legal review', owner: 'Dev' },
                  { task: 'Schedule follow-up', owner: 'Meera' },
                ],
                badge: null as string | null,
              },
              {
                icon: Gauge,
                title: 'Sentiment',
                body: 'A read on the room, so you can catch friction early.',
                sample: 'Constructive throughout, with mild tension around the timeline in the final ten minutes.',
                items: null as { task: string; owner: string }[] | null,
                badge: 'POSITIVE',
              },
            ].map((card, i) => (
              <motion.div key={i} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }}>
                <div className="h-full p-6 rounded-2xl bg-surface border border-line elev-1 hover:border-line-hover transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-iris-soft border border-iris-line flex items-center justify-center text-iris mb-4">
                    <card.icon className="w-4 h-4" />
                  </div>
                  <h3 className="t-h3 mb-1.5">{card.title}</h3>
                  <p className="t-small text-ink-3 mb-5">{card.body}</p>

                  <div className="rounded-xl bg-surface-inset border border-line p-4">
                    {card.badge && (
                      <span className="inline-block mb-2.5 px-2 py-0.5 rounded-full bg-live-soft border border-live-line text-live-ink t-caption font-semibold">
                        {card.badge}
                      </span>
                    )}
                    {card.items ? (
                      <ul className="space-y-2.5">
                        {card.items.map((it, k) => (
                          <li key={k} className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded border border-iris-line bg-iris-soft mt-0.5 shrink-0" />
                            <span className="t-small text-ink-2 leading-snug">
                              {it.task}
                              <span className="ml-2 px-1.5 py-0.5 rounded bg-saffron-soft text-saffron-ink t-caption">
                                {it.owner}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="t-small text-ink-2 leading-relaxed">{card.sample}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ Features --------------------------- */}
      <section className="py-24 lg:py-28 bg-canvas-raised border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...reveal} className="max-w-2xl mb-14">
            <p className="t-overline text-iris mb-4">Everything else</p>
            <h2 className="t-display-sm text-balance">The parts you stop noticing, because they work.</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Video, title: 'HD video & audio', desc: 'Adaptive bitrate that degrades gracefully instead of freezing.' },
              { icon: Shield, title: 'Waiting rooms', desc: 'Hosts admit guests deliberately. No surprise arrivals.' },
              { icon: Monitor, title: 'Screen sharing', desc: 'Share a tab, a window, or the whole desktop in one click.' },
              { icon: Users, title: 'Guest links', desc: 'Share one link. Guests join by name — no account required.' },
              { icon: Film, title: 'Reactions & raise hand', desc: 'Lightweight signals that keep large calls civil.' },
              { icon: Smartphone, title: 'Host controls', desc: 'Mute all, admit, and end the meeting for everyone at once.' },
            ].map((f, i) => (
              <motion.div key={i} {...reveal} transition={{ ...reveal.transition, delay: (i % 3) * 0.07 }}>
                <div className="h-full p-6 rounded-2xl bg-surface border border-line elev-1 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-hover hover:elev-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-inset border border-line flex items-center justify-center text-ink-2 mb-4">
                    <f.icon className="w-4 h-4" />
                  </div>
                  <h3 className="t-h3 mb-1.5">{f.title}</h3>
                  <p className="t-small text-ink-3 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- How it works ------------------------- */}
      <section id="how" className="py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...reveal} className="text-center mb-16">
            <p className="t-overline text-iris mb-4">How it works</p>
            <h2 className="t-display-sm text-balance">Three steps. About twenty seconds.</h2>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute top-6 left-[16%] right-[16%] rule-fade" aria-hidden="true" />
            <div className="grid md:grid-cols-3 gap-12 relative">
              {[
                { step: '01', title: 'Create a room', desc: 'One click gives you a live room and a shareable code.' },
                { step: '02', title: 'Send the link', desc: 'Invite by email from inside Vaarta, or paste the link anywhere.' },
                { step: '03', title: 'Talk', desc: 'Everyone joins in-browser. The recap lands when you hang up.' },
              ].map((s, i) => (
                <motion.div key={i} {...reveal} transition={{ ...reveal.transition, delay: i * 0.1 }} className="text-center">
                  <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center font-mono text-[13px] font-semibold mb-5 bg-surface border border-iris-line text-iris elev-1">
                    {s.step}
                  </div>
                  <h3 className="t-h3 mb-2">{s.title}</h3>
                  <p className="t-small text-ink-3 leading-relaxed max-w-[24ch] mx-auto">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------- CTA ------------------------------- */}
      <section className="relative py-28 overflow-hidden border-t border-line">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="aurora aurora-iris w-[900px] h-[520px] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 opacity-[0.18] animate-drift" />
        </div>
        <motion.div {...reveal} className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="t-display-sm text-balance">
            Your next meeting could be <em className="italic text-iris">a lot better.</em>
          </h2>
          <p className="t-body text-ink-2 mt-5 max-w-md mx-auto">
            Create a room in one click and see the difference on the first call.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-9">
            <Button size="lg" onClick={onGetStarted} trailing={<ArrowRight className="w-4 h-4" />}>
              Get started free
            </Button>
            <Button size="lg" variant="ghost" onClick={onSignIn}>
              Sign in
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ------------------------------ Footer ----------------------------- */}
      <footer className="border-t border-line bg-canvas-raised">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            <div className="col-span-2">
              <Logo size="sm" className="mb-4" />
              <p className="t-small text-ink-3 max-w-xs leading-relaxed">
                Video conferencing that gets out of the way — and takes the notes.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Intelligence', 'How it works'] },
              { title: 'Company', links: ['About', 'Blog', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="t-small font-semibold text-ink mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="t-small text-ink-3 hover:text-iris transition-colors">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-line flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="t-caption text-ink-3">
              © {new Date().getFullYear()} Vaarta. All rights reserved.
            </p>
            <div className="flex items-center gap-2 t-caption text-ink-3">
              <VaartaMark size={14} className="text-iris" />
              वार्ता — conversation
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
