import { Star } from "lucide-react";
import { VaartaLogo } from "./VaartaLogo";

/**
 * A decorative branding panel used in authentication screens.
 * Contains marketing copy, social proof, and stylized backgrounds.
 */
export function BrandPanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 bg-gradient-to-br from-[#065f46] via-[#047857] to-[#052e26]">
      {/* Subtle structural grid, not glow */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #34d399, transparent 70%)" }}
      />

      <div className="relative z-10">
        <VaartaLogo light />
      </div>

      <div className="relative z-10 max-w-md">
        <h2 className="text-[32px] leading-[1.15] font-semibold tracking-tight text-white mb-4">
          Where the world's teams meet.
        </h2>
        <p className="text-[15px] leading-relaxed text-emerald-50/70">
          Enterprise-grade video conferencing trusted by Fortune 500 teams.
          Built for clarity, security, and scale.
        </p>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className="fill-emerald-300 text-emerald-300" />
          ))}
        </div>
        <p className="text-[14px] leading-relaxed text-emerald-50/90 max-w-sm">
          "Vaarta replaced three tools overnight. The reliability and polish are
          exactly what our leadership expected."
        </p>
        <p className="mt-3 text-[13px] font-medium text-emerald-100/60">
          Director of IT — Global 500 Enterprise
        </p>
      </div>
    </div>
  );
}
