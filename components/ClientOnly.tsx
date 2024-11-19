"use client";

import { useEffect, useState } from "react";

export default function ClientOnly({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      suppressHydrationWarning
      className={`${className} ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      style={{ transition: "opacity 0.2s" }}
    >
      {mounted ? children : null}
    </div>
  );
}
