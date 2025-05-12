"use client";

import { Button, ButtonVariantProps } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

export function OpenSiteButton({
  siteName,
  variant,
  size,
  ...props
}: { siteName: string } & ButtonVariantProps &
  Omit<React.ComponentProps<typeof Link>, "href">) {
  const host = useSyncExternalStore(
    (onChange) => {
      onChange();
      return () => {};
    },
    () => window.location.host,
    () => "vercelle.com"
  );

  return (
    <Button variant={variant} size={size} asChild>
      <Link
        target="_blank"
        rel="noopener noreferrer"
        href={`http://${siteName}.${host}`}
        {...props}
      >
        <ExternalLink className="h-4 w-4 -nt-1 mr-0.5" />
        Open Site
      </Link>
    </Button>
  );
}
