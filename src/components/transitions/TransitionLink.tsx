"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { usePageTransition } from "./TransitionProvider";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/**
 * Drop-in replacement for next/link that routes internal navigation through the page
 * transition. Modifier-clicks, new tabs and external links keep native behaviour because
 * `onNavigate` only fires for same-origin client-side navigation.
 */
export function TransitionLink({ href, onNavigate, ...props }: Props) {
  const { navigate } = usePageTransition();
  return (
    <Link
      href={href}
      onNavigate={(event) => {
        onNavigate?.(event);
        event.preventDefault();
        navigate(href);
      }}
      {...props}
    />
  );
}
