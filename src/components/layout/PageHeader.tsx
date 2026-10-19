import { ReactNode } from "react";
import { EntityMark } from "@/components/icons/EntityIcon";

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  mark?: string;
  children: ReactNode;
}

// Chronus page pattern: a header with a hairline underneath, then a padded body.
export const PageHeader = ({ title, subtitle, actions, mark, children }: Props) => (
  <>
    <header className="sticky top-0 z-10 border-b border-hairline bg-page px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {mark && <EntityMark id={mark} size={44} />}
          <div className="min-w-0">
            <h2 className="type-display-lg sm:type-display-xl text-foreground">{title}</h2>
            {subtitle && <p className="type-body-md mt-1 max-w-[70ch] text-tertiary">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
    <div className="space-y-4 p-4 sm:p-5">{children}</div>
  </>
);
