import { useId } from "react";
import starshipRocket from "./assets/starship-rocket.svg?no-inline";

export default function OriginIllustration() {
  const id = useId();
  const moon = `${id}-moon`;
  const crater = `${id}-crater`;
  const surface = `${id}-surface`;

  return (
    <figure className="origin-illustration">
      <div className="origin-kicker">
        <span className="gold-dash" />A SMALL DISCOVERY
      </div>
      <div className="origin-scene">
        <svg
          viewBox="0 0 480 340"
          fill="none"
          role="img"
          aria-label="STARSHIP 로고의 A 모양 우주선이 치즈 달을 향해 올라가는 장면"
        >
          <defs>
            <linearGradient
              id={moon}
              x1="254"
              y1="47"
              x2="412"
              y2="240"
              gradientUnits="userSpaceOnUse"
            >
              <stop className="origin-light" />
              <stop offset="0.65" className="origin-gold" />
              <stop offset="1" className="origin-gold" />
            </linearGradient>
            <linearGradient id={crater} x1="0" y1="0" x2="0.7" y2="1">
              <stop className="origin-shadow" stopOpacity="0.16" />
              <stop offset="1" className="origin-shadow" stopOpacity="0.035" />
            </linearGradient>
            <clipPath id={surface}>
              <circle cx="336" cy="143" r="111" />
            </clipPath>
          </defs>

          <path className="origin-orbit" d="M68 255C86 151 227 33 379 17" />
          <circle className="origin-orbit-point" cx="379" cy="17" r="3" />

          <circle
            className="origin-moon"
            cx="336"
            cy="143"
            r="111"
            fill={`url(#${moon})`}
          />
          <g clipPath={`url(#${surface})`}>
            {[
              [298, 106, 24, 21, -28],
              [378, 163, 31, 33, 22],
              [317, 215, 13, 10, 15],
              [386, 77, 10, 8, 30],
              [266, 167, 7, 12, -15],
            ].map(([cx, cy, rx, ry, angle]) => (
              <g key={`${cx}-${cy}`} transform={`rotate(${angle} ${cx} ${cy})`}>
                <ellipse
                  className="origin-crater-rim"
                  cx={cx}
                  cy={cy + 1.5}
                  rx={rx}
                  ry={ry}
                />
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx}
                  ry={ry}
                  fill={`url(#${crater})`}
                />
              </g>
            ))}
          </g>

          <path className="origin-trail" d="M68 316C100 308 127 290 146 270" />
          <g className="origin-flight">
            <g transform="rotate(42 177 261)">
              <svg
                className="origin-rocket"
                x="153"
                y="218"
                width="48"
                height="86.4"
                viewBox="100 10 50 90"
                overflow="hidden"
                aria-hidden="true"
              >
                <use href={`${starshipRocket}#rocket`} />
              </svg>
            </g>
          </g>
        </svg>
      </div>
      <figcaption className="origin-caption">
        <span>달에서 발견한 새로운 시작.</span>
        <span className="origin-signature">STARSHIP → CHEESE</span>
      </figcaption>
    </figure>
  );
}
