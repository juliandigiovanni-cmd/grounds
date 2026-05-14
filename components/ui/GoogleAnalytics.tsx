"use client";

import Script from "next/script";
import { useState, useEffect } from "react";

export function GoogleAnalytics() {
  const [consented, setConsented] = useState(false);
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    const check = () => {
      setConsented(localStorage.getItem("grounds_cookie_consent") === "accepted");
    };
    check();
    window.addEventListener("grounds:consent-accepted", check);
    return () => window.removeEventListener("grounds:consent-accepted", check);
  }, []);

  if (!consented || !GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}');
      `}</Script>
    </>
  );
}
