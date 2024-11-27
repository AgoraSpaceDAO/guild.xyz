import { useLayoutEffect, useState } from "react";

const isBetween = (value: number, floor: number, ceil: number) =>
  value >= floor && value <= ceil;

const useScrollspy = (ids: string[], offset = 0) => {
  const [activeId, setActiveId] = useState("");

  useLayoutEffect(() => {
    const listener = () => {
      const scroll = window.scrollY;

      const position = ids
        .map((id) => {
          const element = document.getElementById(id);

          if (!element) return { id, top: -1, bottom: -1 };

          const rect = element.getBoundingClientRect();
          const top = Math.max(0, rect.top + scroll - offset);
          const bottom = Math.max(0, rect.bottom + scroll - offset);

          return { id, top, bottom };
        })
        .find(({ top, bottom }) => isBetween(scroll, top, bottom));

      setActiveId(position?.id || "");
    };

    listener();

    window.addEventListener("resize", listener);
    window.addEventListener("scroll", listener);

    return () => {
      window.removeEventListener("resize", listener);
      window.removeEventListener("scroll", listener);
    };
  }, [ids, offset]);

  return activeId;
};

export { useScrollspy };
