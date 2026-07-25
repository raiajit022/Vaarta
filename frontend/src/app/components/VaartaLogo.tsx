import { Video } from "lucide-react";

export function VaartaLogo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center justify-center w-8 h-8 rounded-[8px] bg-gradient-to-br from-[#34d399] to-[#059669] shadow-[inset_0px_1px_0px_rgba(255,255,255,0.25),0_1px_2px_rgba(6,95,70,0.3)]">
        <Video size={17} className="text-white" strokeWidth={2.2} />
      </div>
      <span
        className={`font-semibold text-lg tracking-tight ${
          light ? "text-white" : "text-stone-900 dark:text-white"
        }`}
      >
        Vaarta
      </span>
    </div>
  );
}
