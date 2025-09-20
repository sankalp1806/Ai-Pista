'use client';
import { useEffect, useRef, useState } from 'react';
import { Github, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  owner: string;
  repo: string;
  className?: string;
  theme?: 'light' | 'dark';
};

export default function GithubStar({ owner, repo, className, theme }: Props) {
  const [targetCount, setTargetCount] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState<number>(0);
  const animRef = useRef<number | null>(null);
  const didAnimateRef = useRef(false);

  // Fetch stars from API every 5 min
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/github/stars?owner=${owner}&repo=${repo}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (cancelled) return;
        if (data?.ok && typeof data.stars === 'number') {
          setTargetCount(data.stars);
        } else {
          setTargetCount(null);
        }
      } catch {
        if (!cancelled) setTargetCount(null);
      }
    };
    load();
    const id = setInterval(load, 300000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [owner, repo]);

  // Animate star count
  useEffect(() => {
    if (targetCount == null) return;

    if (didAnimateRef.current) {
      setDisplayCount(targetCount);
      return;
    }

    didAnimateRef.current = true;
    setDisplayCount(0);
    const duration = 2000; // ms
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const value = Math.floor(eased * targetCount);
      setDisplayCount(value);
      if (t < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayCount(targetCount);
      }
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [targetCount]);

  const countText = targetCount == null ? '0' : displayCount.toLocaleString();

  // Set theme classes based on theme prop
  const isLight = theme === 'light';
  const isDark = theme === 'dark';

  return (
    <a
      href={`https://github.com/${owner}/${repo}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group inline-flex p-2 items-center gap-2 rounded-lg  border transition-colors text-sm px-2',
        isLight && 'bg-white text-black hover:bg-gray-100 border-gray-200',
        isDark && 'bg-black text-white hover:bg-black/90 border-neutral-900',
        !theme && 'bg-white text-black hover:bg-gray-100 border-gray-200 dark:bg-black dark:text-white hover:dark:bg-black/90 dark:border-neutral-900',
        className
      )}
      title="Star on GitHub"
      aria-label="Star this project on GitHub"
    >
      {/* GitHub icon + text */}
      <div className="flex items-center">
        <Github
          className={cn(
            "mr-1 size-4 fill-current",
            isLight && "text-black",
            isDark && "text-white",
            !theme && "text-black dark:text-white"
          )}
          aria-hidden="true"
        />
        <span className="ml-1 lg:hidden">Star</span>
        <span className="ml-1 hidden lg:inline">GitHub</span>
      </div>

      {/* Star icon + animated count */}
      <div className="flex items-center gap-1 text-sm">
        <Star
          className={cn(
            "relative top-px size-4 fill-current transition-colors duration-300 group-hover:fill-yellow-400 group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]",
            isLight && "text-black",
            isDark && "text-white",
            !theme && "text-black dark:text-white"
          )}
          aria-hidden="true"
        />
        <span className="font-medium tabular-nums min-w-[2rem] text-right">{countText}</span>
      </div>
    </a>
  );
}
