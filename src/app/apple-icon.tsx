import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 128 128"
          width="140"
          height="140"
        >
          <defs>
            <linearGradient id="gradBrain" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffcad4" />
              <stop offset="100%" stopColor="#ff7fa1" />
            </linearGradient>
            <linearGradient id="gradSeed" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffe6a1" />
              <stop offset="100%" stopColor="#ffd27f" />
            </linearGradient>
          </defs>

          <path
            d="M64 8 C40 8, 16 40, 32 88 C64 120, 96 104, 96 64 C96 40, 80 8, 64 8 Z"
            fill="url(#gradBrain)"
          />

          <g transform="translate(32,32)">
            <path
              d="M32 32c-12 0-18-12-18-12s6-16 18-16 18 16 18 16-6 12-18 12z"
              fill="#fff"
              opacity="0.95"
            />

            <circle cx="24" cy="28" r="6" fill="#4d4d4d" />
            <circle cx="40" cy="28" r="6" fill="#4d4d4d" />
            <circle cx="25" cy="27" r="2" fill="#fff" opacity="0.7" />
            <circle cx="41" cy="27" r="2" fill="#fff" opacity="0.7" />

            <circle cx="20" cy="38" r="3.5" fill="#ff9eb3" opacity="0.6" />
            <circle cx="44" cy="38" r="3.5" fill="#ff9eb3" opacity="0.6" />

            <path
              d="M24 42 Q32 50 40 42"
              stroke="#4d4d4d"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />

            <path
              d="M48 16c4-3 8-8 4-12-4-4-10-2-12 3-2 4 0 8 2 10 2 2 5 2 6-1z"
              fill="url(#gradSeed)"
              opacity="0.95"
            />
          </g>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
