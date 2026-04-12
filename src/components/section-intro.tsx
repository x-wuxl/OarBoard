interface SectionIntroProps {
  title: string;
  description: string;
  trailing?: React.ReactNode;
  className?: string;
}

export function SectionIntro({ title, description, trailing, className }: SectionIntroProps) {
  return (
    <div className={className ?? 'mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'}>
      <div>
        <h2 className="text-xl font-semibold tracking-[0.02em] text-white/90">{title}</h2>
        <p className="mt-1 text-sm text-oar-muted">{description}</p>
      </div>
      {trailing ?? null}
    </div>
  );
}
