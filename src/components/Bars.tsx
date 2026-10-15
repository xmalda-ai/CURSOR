"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Bucket } from "@/lib/aggregate";
import { formatShare } from "@/lib/format";

gsap.registerPlugin(ScrollTrigger);

export function Bars({ title, buckets }: { title: string; buckets: Bucket[] }) {
  const root = useRef<HTMLElement>(null);
  const signature = buckets.map((bucket) => bucket.count).join(",");
  const max = Math.max(...buckets.map((bucket) => bucket.count), 1);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.fromTo(
        "[data-bar]",
        { scaleX: reduce ? 1 : 0 },
        {
          scaleX: 1,
          duration: reduce ? 0 : 0.85,
          ease: "power2.out",
          stagger: reduce ? 0 : 0.045,
          transformOrigin: "left center",
          scrollTrigger: {
            trigger: root.current,
            start: "top 92%",
            once: true,
          },
        },
      );
    },
    { scope: root, dependencies: [signature], revertOnUpdate: true },
  );

  return (
    <section ref={root} className="panel">
      <h2>{title}</h2>
      <ul className="bars">
        {buckets.map((bucket) => (
          <li key={bucket.value}>
            <div className="bar-label">
              <span>{bucket.label}</span>
              <span>{bucket.count}</span>
            </div>
            <div className="bar-track" aria-hidden="true">
              <div className="bar-fill" data-bar style={{ width: `${(bucket.count / max) * 100}%` }} />
            </div>
            <span className="bar-share">{formatShare(bucket.share)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
