import React from "react";
import { cn } from "@/lib/utils";
import { Marquee } from "./marquee";


import { reviews } from "./testimonials.data";

// Split reviews into three rows
const firstRow = reviews.slice(0, Math.floor(reviews.length / 3));
const secondRow = reviews.slice(Math.floor(reviews.length / 3), Math.floor(2 * reviews.length / 3));
const thirdRow = reviews.slice(Math.floor(2 * reviews.length / 3));



const TwitterBird = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path
      fill="currentColor"
      d="M19.633 7.997c.013.178.013.357.013.535 0 5.454-4.154 11.747-11.747 11.747-2.337 0-4.503-.68-6.326-1.857.325.038.636.051.974.051a8.313 8.313 0 0 0 5.151-1.775 4.157 4.157 0 0 1-3.878-2.878c.254.038.51.064.777.064.374 0 .748-.051 1.096-.14A4.149 4.149 0 0 1 2.83 9.697v-.051c.546.305 1.18.497 1.854.523a4.145 4.145 0 0 1-1.85-3.45c0-.764.203-1.468.558-2.081a11.79 11.79 0 0 0 8.553 4.338 4.681 4.681 0 0 1-.102-.95 4.146 4.146 0 0 1 7.17-2.84 8.167 8.167 0 0 0 2.633-1.006 4.134 4.134 0 0 1-1.824 2.287 8.29 8.29 0 0 0 2.383-.637 8.897 8.897 0 0 1-2.192 2.28z"
    />
  </svg>
);

const ReviewCard = ({
  img,
  name,
  username,
  body,
  href,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
  href?: string;
}) => {
  const content = (
    <figure
      className={cn(
        "group relative h-full w-72 sm:w-80 md:w-96 cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl border p-5 sm:p-6 md:p-7",
        "border-white/20 bg-gradient-to-br from-black/98 via-black/90 to-black/98 backdrop-blur-3xl",
        "transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-white/30",
        "hover:shadow-[0_35px_80px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(255,255,255,0.05)]",
        // Subtle polished reflection - much darker
        "before:absolute before:inset-0 before:rounded-xl before:sm:rounded-2xl",
        "before:bg-[linear-gradient(135deg,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0.08)_25%,rgba(255,255,255,0.04)_50%,transparent_70%)]",
        "before:opacity-40 before:pointer-events-none before:transition-opacity before:duration-500",
        "group-hover:before:opacity-60",
        // Very subtle shimmer effect
        "after:absolute after:inset-0 after:rounded-xl after:sm:rounded-2xl",
        "after:bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.06)_30%,transparent_60%)]",
        "after:opacity-30 after:pointer-events-none after:transition-all after:duration-500",
        "group-hover:after:opacity-50 group-hover:after:scale-105",
        // Dark texture overlay
        "[background-image:linear-gradient(to_bottom_right,rgba(0,0,0,0.98),rgba(0,0,0,0.90),rgba(0,0,0,0.98)),radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.03),transparent_50%)]",
        "[background-size:100%_100%,80%_80%] [background-position:0_0,0_0]"
      )}
      style={{
        boxShadow: `
          0 32px 64px -12px rgba(0,0,0,0.9),
          inset 0 3px 6px rgba(255,255,255,0.2),
          inset 0 -2px 4px rgba(255,255,255,0.1),
          0 0 0 1px rgba(255,255,255,0.08),
          0 1px 3px rgba(255,255,255,0.1)
        `
      }}
      role="article"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img className="rounded-full border border-white/10" width="40" height="40" alt="" src={img} />
          <div className="min-w-0">
            <figcaption className="text-sm font-semibold text-white truncate max-w-[11rem] flex items-center gap-1">
              {name}
              <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" width="16" height="16" viewBox="0 0 256 256" xmlSpace="preserve">
                <g style={{
                  stroke: "none", 
                  strokeWidth: 0, 
                  strokeDasharray: "none", 
                  strokeLinecap: "butt", 
                  strokeLinejoin: "miter", 
                  strokeMiterlimit: 10, 
                  fill: "none", 
                  fillRule: "nonzero", 
                  opacity: 1
                }} 
                transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                  <path d="M 30.091 10.131 L 30.091 10.131 c 5.28 -13.046 23.695 -13.207 29.202 -0.255 l 0 0 l 0 0 c 12.959 -5.491 26.093 7.416 20.829 20.469 l 0 0 l 0 0 c 13.046 5.28 13.207 23.695 0.255 29.202 l 0 0 l 0 0 c 5.491 12.959 -7.416 26.093 -20.469 20.829 l 0 0 l 0 0 c -5.28 13.046 -23.695 13.207 -29.202 0.255 l 0 0 l 0 0 C 17.748 86.122 4.613 73.215 9.878 60.162 l 0 0 l 0 0 C -3.169 54.881 -3.33 36.467 9.623 30.96 l 0 0 l 0 0 C 4.131 18.001 17.038 4.866 30.091 10.131 L 30.091 10.131 z" 
                  style={{
                    stroke: "none", 
                    strokeWidth: 1, 
                    strokeDasharray: "none", 
                    strokeLinecap: "butt", 
                    strokeLinejoin: "miter", 
                    strokeMiterlimit: 10, 
                    fill: "rgb(0,150,241)", 
                    fillRule: "nonzero", 
                    opacity: 1
                  }} 
                  transform=" matrix(1 0 0 1 0 0) " 
                  strokeLinecap="round"/>
                  <polygon points="39.66,63.79 23.36,47.76 28.97,42.05 39.3,52.21 59.6,29.58 65.56,34.93 " 
                  style={{
                    stroke: "none", 
                    strokeWidth: 1, 
                    strokeDasharray: "none", 
                    strokeLinecap: "butt", 
                    strokeLinejoin: "miter", 
                    strokeMiterlimit: 10, 
                    fill: "rgb(255,255,255)", 
                    fillRule: "nonzero", 
                    opacity: 1
                  }} 
                  transform="matrix(1 0 0 1 0 0)" />
                </g>
              </svg>
            </figcaption>
            <p className="text-xs font-medium text-white/60 truncate">{username}</p>
          </div>
        </div>
        <TwitterBird className="w-5 h-5 text-white/70" />
      </div>
      <blockquote className="mt-3 text-[0.95rem] sm:text-[1rem] leading-relaxed text-white/90 line-clamp-4">{body}</blockquote>
    </figure>
  );

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Open tweet">
      {content}
    </a>
  ) : (
    content
  );
};

export function Testimonials() {
  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-[2000px] flex-col items-center justify-center overflow-hidden px-4 sm:px-10 md:px-20 lg:px-40 pt-12 sm:pt-16 md:pt-24 pb-0",
      )}
    >
      <div className="text-center mb-4 sm:mb-6 md:mb-8">
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)] tracking-wide"
          style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
        >
          <span className="inline-block align-middle">Testimonials</span>
        </h2>
      </div>

      <Marquee
        pauseOnHover
        className="w-full px-2 sm:px-8 md:px-16 lg:px-32 [--duration:18s] sm:[--duration:22s] [--gap:0.75rem] sm:[--gap:1.25rem] lg:[--gap:1.75rem] mb-4"
        repeat={2}
      >
        {firstRow.map((review, idx) => (
          <ReviewCard key={`${review.username}-1-${idx}`} {...review} />
        ))}
      </Marquee>
      <Marquee
        reverse
        pauseOnHover
        className="w-full px-2 sm:px-8 md:px-16 lg:px-32 [--duration:18s] sm:[--duration:22s] [--gap:0.75rem] sm:[--gap:1.25rem] lg:[--gap:1.75rem] mb-4"
        repeat={2}
      >
        {secondRow.map((review, idx) => (
          <ReviewCard key={`${review.username}-2-${idx}`} {...review} />
        ))}
      </Marquee>
      <Marquee
        pauseOnHover
        className="w-full px-2 sm:px-8 md:px-16 lg:px-32 [--duration:18s] sm:[--duration:22s] [--gap:0.75rem] sm:[--gap:1.25rem] lg:[--gap:1.75rem]"
        repeat={2}
      >
        {thirdRow.map((review, idx) => (
          <ReviewCard key={`${review.username}-3-${idx}`} {...review} />
        ))}
      </Marquee>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-32 md:w-48 lg:w-64 backdrop-blur-[6px] sm:backdrop-blur-[12px] [mask-image:linear-gradient(to_right,black_0%,black_70%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_0%,black_70%,transparent_100%)]"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-32 md:w-48 lg:w-64 backdrop-blur-[6px] sm:backdrop-blur-[12px] [mask-image:linear-gradient(to_left,black_0%,black_70%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_left,black_0%,black_70%,transparent_100%)]"></div>
    </div>
  );
}
