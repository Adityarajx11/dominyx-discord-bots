import { useEffect, useRef } from "react";

export type Review = {
  name: string;
  server: string;
  rating: number; // 1 to 5
  bot: string; // Music, Security, Greet, Ping, Ticket, Level
  text: string;
};

// Replace these sample reviews with real ones.
const DEFAULT_REVIEWS: Review[] = [
  { name: "LunaByte", server: "Night Shift", rating: 5, bot: "Music", text: "The queue stays out of the way and our DJs can hand off control without breaking the vibe." },
  { name: "KaiRin", server: "Orbit Lounge", rating: 5, bot: "Security", text: "The audit trail makes it obvious what happened and who handled it." },
  { name: "Miko", server: "Cloud Garden", rating: 5, bot: "Ticket", text: "Private support threads feel much calmer now, and transcripts are easy to find." },
  { name: "Juno", server: "After Hours", rating: 5, bot: "Greet", text: "New members get the right role and a warm hello without three bots talking at once." },
  { name: "Rook", server: "The Workshop", rating: 4, bot: "Level", text: "The commands are focused, quick, and much easier to explain to new staff." },
  { name: "Nera", server: "Pixel Harbor", rating: 5, bot: "Music", text: "A clean queue and simple DJ controls were exactly what our voice channels needed." },
  { name: "Vex", server: "Common Room", rating: 5, bot: "Security", text: "Verification is clear for members and the mod logs are actually useful." },
  { name: "Sable", server: "Maple Street", rating: 4, bot: "Ticket", text: "Our helpers can keep conversations private without losing the history." },
  { name: "Dax", server: "Low Orbit", rating: 5, bot: "Greet", text: "The welcome flow feels intentional instead of like an automated wall of text." },
  { name: "Bryn", server: "Signal Room", rating: 5, bot: "Level", text: "The progression tools give our community something to return to every day." },
  { name: "Ines", server: "Moss Light", rating: 5, bot: "Music", text: "It feels like one dependable layer instead of a pile of unrelated bots." },
  { name: "Tomo", server: "Arcade 404", rating: 4, bot: "Security", text: "The focused controls make routine moderation faster for the whole team." },
  { name: "Rhea", server: "Blue Hour", rating: 5, bot: "Ticket", text: "A ticket becomes a real conversation, not another noisy channel to babysit." },
  { name: "Ulric", server: "Lantern Club", rating: 5, bot: "Greet", text: "The first impression is smoother and the server stays focused on people." },
];

type Props = {
  reviews?: Review[];
  heading?: string;
  /** Pass a site heading class here to match the surrounding typography. */
  headingClassName?: string;
  /** Stage background. Keep "transparent" so your video background shows through. */
  background?: string;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export default function ReviewsGallery({
  reviews = DEFAULT_REVIEWS,
  heading = "What servers say about Aurex",
  headingClassName = "",
  background = "transparent",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const ctrRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const words = heading.split(" ");

  useEffect(() => {
    const wrap = wrapRef.current!;
    const stage = stageRef.current!;
    const center = centerRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const N = reviews.length;
    const pairs = Math.ceil(N / 2);
    const step = 0.62 / Math.max(pairs - 1, 1);

    // Per-card constants: which arc, when it enters, and a small radius variation.
    // Cards come in left/right pairs that start together, so both sides are always identical (mirrored).
    const cfg = reviews.map((_, i) => ({ dir: i % 2 === 1 ? 1 : -1, start: Math.floor(i / 2) * step, k: 1 }));

    let sp = 0;
    let raf = 0;

    const progress = () => {
      const r = wrap.getBoundingClientRect();
      const total = wrap.offsetHeight - window.innerHeight;
      return clamp(-r.top / total, 0, 1);
    };

    const layout = () => {
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      const cw = cardRefs.current[0]?.offsetWidth ?? 250;
      const M = W < 640 ? 18 : Math.max(56, W * 0.05);
      const Rx = Math.max(16, W / 2 - cw / 2 - M);
      const Ry = H * 0.36;
      const DUR = 0.36;

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const c = cfg[i];
        const t = clamp((sp - c.start) / DUR, 0, 1);
        if (!(sp > c.start && t < 1)) {
          el.style.opacity = "0";
          return;
        }
        // Mirrored arcs: both sides ride the same circle from the bottom (90deg) up to the top, then fade out.
        const a = ((90 - c.dir * t * 170) * Math.PI) / 180;
        let x = Rx * Math.cos(a) * c.k;
        const y = Ry * Math.sin(a) * c.k;
        const z = 350 * Math.sin(a); // bottom = closest and biggest
        // Keep every card fully on screen and clear of the counter/label gutters.
        const s = 1000 / (1000 - z);
        const lim = Math.max(0, W / 2 - M - (cw / 2) * s * 0.92) / s;
        x = clamp(x, -lim, lim);
        const ry = -Math.cos(a) * 35; // tilt toward the center like a carousel
        el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg) rotateX(8deg)`;
        // Dim cards that pass close to the heading so the text stays readable.
        const kx = Math.abs(x * s) / (W * 0.26);
        const ky = Math.abs(y * s) / (H * 0.17);
        const kk = Math.min(1, Math.max(kx, ky));
        el.style.opacity = (Math.min(1, t / 0.06, (1 - t) / 0.2) * (0.3 + 0.7 * kk * kk)).toFixed(3);
        el.style.zIndex = String(Math.round((z + 500) / 10));
      });

      // Center text rises in sync with the first cards, then softly leaves.
      const rise = clamp(sp / 0.12, 0, 1);
      const out = clamp((sp - 0.9) / 0.1, 0, 1);
      center.style.transform = `translateY(${((1 - rise) * 60).toFixed(1)}px) scale(${(0.96 + 0.04 * rise).toFixed(3)})`;
      center.style.opacity = (rise * (1 - out)).toFixed(3);
      center.style.filter = reduced ? "none" : `blur(${(out * 8).toFixed(1)}px)`;

      wordRefs.current.forEach((w, k) => {
        if (!w) return;
        const v = clamp((sp - (0.08 + k * 0.05)) / 0.08, 0, 1);
        w.style.opacity = String(v);
        w.style.transform = `translateY(${((1 - v) * 24).toFixed(1)}px)`;
        w.style.filter = reduced ? "none" : `blur(${((1 - v) * 12).toFixed(1)}px)`;
      });

      if (ctrRef.current) ctrRef.current.textContent = `(${Math.round(sp * 100)})`;
      if (fillRef.current) fillRef.current.style.height = `${(sp * 100).toFixed(1)}%`;
      if (hintRef.current) hintRef.current.style.opacity = sp > 0.02 ? "0" : "1";
    };

    // Only runs while scrolling or easing, then goes idle (saves battery).
    let running = false;
    const frame = () => {
      const tg = progress();
      sp += (tg - sp) * (reduced ? 1 : 0.1);
      if (Math.abs(tg - sp) < 0.0004) sp = tg;
      layout();
      if (sp !== tg) raf = requestAnimationFrame(frame);
      else running = false;
    };
    const kick = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    kick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, [reviews]);

  return (
    <>
      <style>{CSS}</style>
      {/* IMPORTANT: no parent of this component may have overflow hidden/auto or a transform, or the sticky stage breaks. */}
      <div className="ag-wrap" ref={wrapRef}>
        <div className="ag-stage" ref={stageRef} style={{ background }}>
          <div className="ag-center" ref={centerRef}>
            <h2 className={`ag-title ${headingClassName}`}>
              {words.map((w, k) => (
                <span key={k}>
                  <span className="ag-w" ref={(el) => { wordRefs.current[k] = el; }}>{w}</span>{" "}
                </span>
              ))}
            </h2>
            <div className="ag-orb" />
          </div>

          {reviews.map((r, i) => (
            <div className="ag-card" key={i} ref={(el) => { cardRefs.current[i] = el; }}>
              <div className="ag-top">
                <div className="ag-av">{r.name[0]}</div>
                <div className="ag-nm">
                  Sample / {r.name}
                  <small>{r.server}</small>
                </div>
                <div className="ag-st">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
              </div>
              <p className="ag-tx">{r.text}</p>
              <span className="ag-tg">{r.bot}</span>
            </div>
          ))}

          <div className="ag-ctr" ref={ctrRef}>(0)</div>
          <div className="ag-lab">
            <span>Reviews</span>
            <div className="ag-bar"><i ref={fillRef} /></div>
          </div>
          <div className="ag-hint" ref={hintRef}>Scroll to start</div>
        </div>
      </div>
    </>
  );
}

const CSS = `
.ag-wrap{position:relative;height:560vh;--ag-cw:250px;--ag-ch:146px;--ag-line:rgba(255,255,255,.14);--ag-mute:#9aa0b4;color:#f3f4f8}
.ag-stage{position:sticky;top:0;height:100vh;height:100svh;overflow:hidden;perspective:1000px;perspective-origin:50% 50%}
.ag-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;text-align:center;pointer-events:none;z-index:200;will-change:transform,opacity,filter}
.ag-title{margin:0;font-size:clamp(18px,3.2vw,44px);line-height:1.1;letter-spacing:-.02em;word-spacing:normal;max-width:44vw;min-width:200px}
.ag-w{display:inline-block;will-change:transform,opacity,filter}
.ag-orb{width:54px;height:54px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#cfd5ff 55%,#7c8cff);box-shadow:0 0 40px 8px rgba(124,140,255,.45)}
.ag-card{position:absolute;left:50%;top:50%;width:var(--ag-cw);height:var(--ag-ch);margin:calc(var(--ag-ch)/-2) 0 0 calc(var(--ag-cw)/-2);padding:14px 16px;border-radius:16px;border:1px solid var(--ag-line);background:rgba(22,24,34,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;flex-direction:column;justify-content:space-between;opacity:0;will-change:transform,opacity;backface-visibility:hidden}
.ag-top{display:flex;align-items:center;gap:10px}
.ag-av{width:30px;height:30px;border-radius:50%;border:1px solid var(--ag-line);display:grid;place-items:center;font-size:13px;flex:none}
.ag-nm{font-size:13px;font-weight:600;line-height:1.2;min-width:0}
.ag-nm small{display:block;font-weight:400;color:var(--ag-mute);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ag-st{margin-left:auto;font-size:11px;letter-spacing:1px;color:#fff;white-space:nowrap}
.ag-tx{margin:0;font-size:13px;line-height:1.35;color:#d9dcea;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.ag-tg{align-self:flex-start;font-size:10.5px;padding:3px 9px;border:1px solid var(--ag-line);border-radius:99px;color:var(--ag-mute)}
.ag-ctr{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:11px;color:var(--ag-mute);z-index:300;font-variant-numeric:tabular-nums}
.ag-lab{position:absolute;right:14px;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:10px;z-index:300;font-size:11px;color:var(--ag-mute)}
.ag-lab span{writing-mode:vertical-rl}
.ag-bar{width:2px;height:120px;background:var(--ag-line);position:relative;overflow:hidden;border-radius:2px}
.ag-bar i{position:absolute;left:0;top:0;width:100%;height:0;background:#fff}
.ag-hint{position:absolute;bottom:28px;left:0;right:0;text-align:center;font-size:12px;color:var(--ag-mute);z-index:3;transition:opacity .3s}
@media (max-width:640px){
  .ag-wrap{--ag-cw:176px;--ag-ch:122px}
  .ag-card{padding:10px 12px}
  .ag-tx{font-size:11.5px;-webkit-line-clamp:2}
  .ag-nm{font-size:12px}
  .ag-av{width:26px;height:26px}
  .ag-st{display:none}
  .ag-title{max-width:60vw}
}
`;
