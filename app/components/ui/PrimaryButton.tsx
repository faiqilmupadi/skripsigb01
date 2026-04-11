"use client";

type Props = {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
};

export default function PrimaryButton({ children, disabled, type = "button", className }: Props) {
  return (
    <button type={type} disabled={disabled} className={className}>
      {children}
    </button>
  );
}
