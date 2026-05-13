interface PageHeaderProps {
  title: string;
  breadcrumb?: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="relative bg-slate-950 px-8 pt-8 pb-20 overflow-hidden">
      {/* Mesh gradient blurs */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-pink-600 rounded-full blur-[120px]" />
        <div className="absolute top-0 -right-1/4 w-3/4 h-full bg-purple-900 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-white/60 mt-1.5 text-sm font-medium max-w-2xl">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
