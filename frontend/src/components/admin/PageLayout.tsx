import { cn } from "@/lib/utils";

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
    </div>
  );
}

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function PageSection({ children, className, title, description }: PageSectionProps) {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-elevation-sm", className)}>
      {title && (
        <div className="flex flex-col space-y-1 p-6 pb-0">
          {title && <h3 className="fluid-2xl font-semibold leading-none tracking-tight">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className={cn("p-6", title && "pt-4")}>
        {children}
      </div>
    </div>
  );
}
