import React, { useEffect } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
  position?: "left" | "right";
  title?: string;
  showOverlay?: boolean;
}

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  width = "384px",
  position = "right",
  title,
  showOverlay = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const positionClasses = position === "left" ? "left-0" : "right-0";

  const translateClasses =
    position === "left"
      ? isOpen
        ? "translate-x-0"
        : "-translate-x-full"
      : isOpen
      ? "translate-x-0"
      : "translate-x-full";

  return (
    <>
      {showOverlay && (
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
            isOpen
              ? "opacity-50 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 ${positionClasses} h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${translateClasses}`}
        style={{ width }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
            {title && (
              <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            )}
            <button
              onClick={onClose}
              className="ml-auto p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-600 hover:text-gray-800"
              aria-label="Yopish"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </div>
      </div>
    </>
  );
};

export default Drawer;
