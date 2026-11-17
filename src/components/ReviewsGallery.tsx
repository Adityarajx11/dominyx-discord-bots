import { useEffect, useRef } from "react";

export type Review = {
  name: string;
  server: string;
  rating: number;
  bot: string;
  text: string;
};

type Props = {
  reviews?: Review[];
  heading?: string;
  headingClassName?: string;
  background?: string;
};

export default function ReviewsGallery({
  heading = "What servers say about Aurex",
  headingClassName = "",
  background = "transparent",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const reveal = () => wrap.classList.toggle("is-visible", wrap.getBoundingClientRect().top < window.innerHeight * 0.86);
    reveal();
    if (!motion.matches) return;
    window.addEventListener("scroll", reveal, { passive: true });
    return () => window.removeEventListener("scroll", reveal);
  }, []);

  return (
    <div className="ag-wrap" ref={wrapRef} style={{ background }}>
      <div className="ag-stage">
        <div className="ag-center">
          <div className="ag-orb" aria-hidden="true">
            <img src="/assets/aurex-mark-white.png" alt="" />
          </div>
          <span className="ag-kicker">REAL STORIES / COMING SOON</span>
          <h2 className={`ag-title ${headingClassName}`}>{heading}</h2>
          <p className="ag-copy">
            We are collecting verified server stories before publishing them here. No invented quotes, ratings, or names.
          </p>
          <a className="ag-link" href="#connect">Share your server story <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </div>
  );
}

const CSS = `
.ag-wrap{position:relative;min-height:clamp(390px,58vh,600px);padding:clamp(76px,10vw,126px) 24px;background:transparent;color:#f4f4f0;overflow:clip;opacity:0;transform:translateY(18px);transition:opacity .7s ease,transform .7s ease}
.ag-wrap.is-visible{opacity:1;transform:none}
.ag-stage{position:relative;display:grid;place-items:center;min-height:clamp(300px,42vh,460px);border-top:1px solid rgba(244,244,240,.12);border-bottom:1px solid rgba(244,244,240,.12)}
.ag-stage::before{content:"";position:absolute;inset:10% 20%;background:radial-gradient(circle,rgba(92,225,230,.12),transparent 62%);filter:blur(24px);pointer-events:none}
.ag-center{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;max-width:620px;text-align:center}
.ag-orb{display:grid;place-items:center;width:68px;height:68px;margin-bottom:20px;border:1px solid rgba(92,225,230,.62);border-radius:50%;background:rgba(92,225,230,.07);box-shadow:0 0 0 8px rgba(92,225,230,.035),0 0 36px rgba(92,225,230,.24);animation:agPulse 4s ease-in-out infinite}
.ag-orb img{width:42px;height:42px;object-fit:contain}
.ag-kicker{color:#5ce1e6;font:10px/1.2 "JetBrains Mono",monospace;letter-spacing:.15em}
.ag-title{margin:14px 0 0;color:#f4f4f0;font-family:"Space Grotesk",system-ui,sans-serif;font-size:clamp(30px,5vw,62px);font-weight:600;line-height:1.05;letter-spacing:-.05em}
.ag-copy{max-width:490px;margin:18px 0 0;color:#c8cdd2;font:clamp(14px,1.6vw,17px)/1.6 Inter,system-ui,sans-serif}
.ag-link{display:inline-flex;align-items:center;gap:8px;margin-top:24px;color:#f4f4f0;font:600 12px/1 Inter,system-ui,sans-serif;text-decoration:none}
.ag-link:hover,.ag-link:focus-visible{color:#5ce1e6}
.ag-link span{color:#5ce1e6;font-size:16px}
@keyframes agPulse{0%,100%{transform:scale(1);box-shadow:0 0 0 8px rgba(92,225,230,.035),0 0 36px rgba(92,225,230,.24)}50%{transform:scale(1.04);box-shadow:0 0 0 12px rgba(92,225,230,.025),0 0 48px rgba(92,225,230,.34)}}
@media (max-width:640px){.ag-wrap{min-height:360px;padding:64px 18px}.ag-stage{min-height:290px}.ag-copy{font-size:14px}.ag-orb{width:60px;height:60px}.ag-orb img{width:36px;height:36px}}
@media (prefers-reduced-motion:reduce){.ag-wrap{opacity:1;transform:none;transition:none}.ag-orb{animation:none}}
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.append(style);
}
