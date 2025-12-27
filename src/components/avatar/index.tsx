import React from "react";

type Props = {
  fullName: string;
  color?: string;
};

const Avatar: React.FC<Props> = ({ fullName, color = "#D1D5DC" }) => {
  const words = fullName.trim().split(/\s+/);
  const initials = words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");

  return (
    <div className="flex items-center gap-x-3">
      <div
        className={`w-9 h-9 flex items-center justify-center font-medium rounded-full shadow-md text-[15px] ${
          color === "#D1D5DC" ? "text-black" : "text-white"
        }`}
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      <span className="font-medium text-lg text-white">{fullName}</span>
    </div>
  );
};

export default Avatar;
