interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <div 
      className="h-16 flex items-center px-6"
      style={{ background: "var(--header-gradient)" }}
    >
      <h1 className="text-xl font-semibold text-primary-foreground">{title}</h1>
    </div>
  );
}
