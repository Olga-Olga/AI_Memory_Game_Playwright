export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`grid grid-cols-2 gap-1 ${compact ? 'h-7 w-7' : 'h-11 w-11'}`} aria-hidden>
        <span className="rounded-[3px] bg-neon-cyan shadow-[0_0_10px] shadow-neon-cyan" />
        <span className="rounded-[3px] border border-indigo-400/40 bg-indigo-950" />
        <span className="rounded-[3px] border border-indigo-400/40 bg-indigo-950" />
        <span className="rounded-[3px] bg-neon-pink shadow-[0_0_10px] shadow-neon-pink" />
      </div>
      <div className="font-display leading-none">
        <div className={`font-black tracking-[0.18em] text-white ${compact ? 'text-base' : 'text-2xl sm:text-3xl'}`}>
          NEON<span className="text-glow text-neon-cyan">RECALL</span>
        </div>
        {!compact && <div className="mt-1.5 text-[10px] tracking-[0.5em] text-slate-400">MEMORY ARENA</div>}
      </div>
    </div>
  )
}
