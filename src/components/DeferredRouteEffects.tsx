"use client";

import { useEffect, useState } from "react";
import { RouteEffects } from "@/components/RouteEffects";

export function DeferredRouteEffects() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <RouteEffects />;
}
