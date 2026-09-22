export default function Logo() {
  return (
    <span className="logo-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32">
        <path
          d="M6 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3Z"
          fill="currentColor"
        />
        <circle cx="11" cy="12" r="2" fill="#fff" />
        <circle cx="22" cy="19" r="3" fill="#fff" />
        <circle cx="12" cy="23" r="1.5" fill="#fff" />
      </svg>
    </span>
  );
}
