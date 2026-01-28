interface PageHeaderProps {
  title: string;
  breadcrumb?: string;
}

export function PageHeader({ title, breadcrumb }: PageHeaderProps) {
  return (
    <div
      className="px-6 pt-6 pb-16"
      style={{ background: "var(--header-gradient)" }}
    >
      {breadcrumb && (
        <div className="text-sm text-primary-foreground/80 mb-2">
          {breadcrumb}
        </div>
      )}

      <h1 className="text-2xl font-semibold text-primary-foreground">
        {title}
      </h1>
    </div>
  );
}
