import { cn } from "../utils/tailwind-cn";

interface ButtonProps {
  children: React.ReactNode;
  handleBtnClick?: () => void;
  className?: string;
  isDisabled?: boolean;
}

export default function Button({
  children,
  handleBtnClick,
  className,
  isDisabled,
}: ButtonProps) {
  const btnStyles = cn("btn", className);

  return (
    <button
      className={btnStyles}
      onClick={handleBtnClick}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
}
