import bellLogo from "@/assets/bell-logo.png";

/** PlanAlert brand bell mark (custom uploaded artwork). */
export function BellLogo({ className }: { className?: string }) {
  return (
    <img
      src={bellLogo}
      alt=""
      aria-hidden="true"
      width={213}
      height={256}
      className={className}
    />
  );
}

export default BellLogo;
