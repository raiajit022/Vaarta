import { Check } from 'lucide-react';
import { Logo, VaartaMark } from '../ui/Logo';

const PROOF = [
  'Instant rooms — no scheduling required',
  'Guests join from the browser, no account',
  'Summary and action items after every call',
];

/**
 * Left-hand panel on the auth screens.
 *
 * Leans on the meaning of the product's name rather than fabricated customer
 * quotes, and states only capabilities the product actually ships.
 */
export function BrandPanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 bg-canvas-raised border-r border-line">
      {/* Atmosphere */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="aurora aurora-iris w-[620px] h-[620px] -top-40 -left-32 opacity-[0.28] animate-drift" />
        <div
          className="aurora aurora-saffron w-[420px] h-[420px] -bottom-32 -right-24 opacity-[0.14] animate-drift"
          style={{ animationDelay: '-7s' }}
        />
        <div
          className="absolute inset-0 grid-field opacity-50"
          style={{ maskImage: 'radial-gradient(ellipse 70% 70% at 30% 30%, #000 20%, transparent 75%)' }}
        />
      </div>

      <div className="relative z-10">
        <Logo size="md" />
      </div>

      <div className="relative z-10 max-w-md">
        <div className="flex items-baseline gap-3 mb-6">
          <span className="font-display text-[44px] leading-none text-iris">वार्ता</span>
          <span className="t-caption text-ink-3 font-mono">/vaːrtaː/</span>
        </div>

        <h2 className="t-display-sm text-ink mb-5 text-balance">
          <em className="italic">noun.</em> Conversation.
        </h2>

        <p className="t-body text-ink-2 leading-relaxed">
          We named it after the thing that actually matters on a call. Everything
          else — the grid, the codes, the controls — gets out of the way.
        </p>
      </div>

      <div className="relative z-10">
        <ul className="space-y-3 mb-8">
          {PROOF.map((line) => (
            <li key={line} className="flex items-start gap-2.5">
              <span className="w-4 h-4 rounded-full bg-iris-soft border border-iris-line flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 text-iris" strokeWidth={3} />
              </span>
              <span className="t-small text-ink-2">{line}</span>
            </li>
          ))}
        </ul>
        <div className="rule-fade mb-5" />
        <div className="flex items-center gap-2 t-caption text-ink-3">
          <VaartaMark size={13} className="text-iris" />
          Built for teams that talk more than they type.
        </div>
      </div>
    </div>
  );
}
