import { type ReactNode } from "react";

const Container = ({ children }: { children: ReactNode }) => {
  return <div className="px-1">{children}</div>;
};

export default Container;
