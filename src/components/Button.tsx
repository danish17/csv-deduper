import { cn } from "@/lib/utils";

type ButtonProps = {
  variant?: string;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({
  children,
  variant,
  className,
  ...rest
}: ButtonProps) => {
  const baseStyles =
    "px-8 py-2 rounded-md text-white font-light transition duration-200 ease-linear";
  const defaultStyles =
    "bg-[#0070f3] shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-[rgba(0,118,255,0.9)] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none";
  const outlineStyles =
    "border-[1px] border-[#0070f3] text-[#0070f3] hover:bg-[rgba(0,118,255,0.1)] transition-colors";

  const combinedClassName = cn(
    baseStyles,
    (!variant || variant === "default") && defaultStyles,
    variant === "outline" && outlineStyles,
    className
  );

  return (
    <button className={combinedClassName} {...rest}>
      {children}
    </button>
  );
};
