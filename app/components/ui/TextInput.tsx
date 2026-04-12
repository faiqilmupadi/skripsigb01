"use client";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "password";
  className?: string;
  autoComplete?: string;
};

export default function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className,
  autoComplete,
}: Props) {
  return (
    <input
      className={className}
      value={value}
      suppressHydrationWarning
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      autoComplete={autoComplete}
    />
  );
}
