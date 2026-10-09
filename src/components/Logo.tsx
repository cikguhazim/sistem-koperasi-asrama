/* eslint-disable @next/next/no-img-element */
export default function Logo({ className = "h-11" }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="Logo Koperasi Asrama"
      className={`w-auto select-none ${className}`}
      draggable={false}
    />
  );
}
