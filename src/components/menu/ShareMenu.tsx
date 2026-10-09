"use client";

import { useEffect, useState } from "react";
import { ShareSheet } from "@/components/ui/share-sheet";

/**
 * Share or show a QR code for the menu. The link is read from the browser so it
 * always points at the domain the site is served from.
 */
export function ShareMenu() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(`${window.location.origin}/menu`);
  }, []);

  return <ShareSheet url={url} title="Gokudo menu" />;
}
