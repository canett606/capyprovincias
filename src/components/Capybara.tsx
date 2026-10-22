export function Capybara({ mood = "happy", label = "Capibara" }: { mood?: "happy" | "oops" | "cheer" | "think"; label?: string }) {
  const mouth =
    mood === "oops" ? "M78 92 Q90 84 102 92" : mood === "cheer" || mood === "happy" ? "M74 88 Q90 104 106 88" : "M78 90 Q90 98 102 90";
  const brows = mood === "think" ? "M70 62 L82 68 M110 62 L98 68" : "";
  return (
    <svg className="capy" viewBox="0 0 180 150" role="img" aria-label={label}>
      <ellipse cx="90" cy="118" rx="58" ry="22" fill="#8d5a34" />
      <ellipse cx="90" cy="108" rx="36" ry="16" fill="#e6c39a" />
      <ellipse cx="48" cy="112" rx="14" ry="10" fill="#8d5a34" />
      <ellipse cx="132" cy="112" rx="14" ry="10" fill="#8d5a34" />
      <ellipse cx="90" cy="72" rx="46" ry="38" fill="#a86b3d" />
      <ellipse cx="58" cy="48" rx="12" ry="10" fill="#8d5a34" />
      <ellipse cx="122" cy="48" rx="12" ry="10" fill="#8d5a34" />
      <ellipse cx="90" cy="86" rx="18" ry="12" fill="#e6c39a" />
      <circle cx="74" cy="70" r="4" fill="#1b2a28" />
      <circle cx="106" cy="70" r="4" fill="#1b2a28" />
      <circle cx="75.2" cy="68.6" r="1.2" fill="#fff" />
      <circle cx="107.2" cy="68.6" r="1.2" fill="#fff" />
      <ellipse cx="90" cy="84" rx="7" ry="4.5" fill="#6b3f28" />
      <path d={mouth} fill="none" stroke="#6b3f28" strokeWidth="3" strokeLinecap="round" />
      {brows ? <path d={brows} fill="none" stroke="#6b3f28" strokeWidth="3" strokeLinecap="round" /> : null}
      <ellipse cx="108" cy="40" rx="22" ry="10" fill="#2f8f4e" transform="rotate(-20 108 40)" />
      <circle cx="132" cy="108" r="10" fill="#ef7d1a" />
    </svg>
  );
}
