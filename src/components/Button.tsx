import { cn } from "../utils/tailwind-cn";

interface ButtonProps {
  children: React.ReactNode;
  handleBtnClick: () => void;
  className?: string;
}

export default function Button({
  children,
  handleBtnClick,
  className,
}: ButtonProps) {
  const btnStyles = cn("btn", className);

  return (
    <button className={btnStyles} onClick={handleBtnClick}>
      {children}
    </button>
  );
}
