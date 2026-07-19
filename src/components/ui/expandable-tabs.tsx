"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".45rem",
    paddingRight: ".45rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".45rem" : 0,
    paddingLeft: isSelected ? ".75rem" : ".45rem",
    paddingRight: isSelected ? ".75rem" : ".45rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.1, type: "spring" as const, bounce: 0, duration: 0.6 };

interface Tab {
  title?: string;
  icon?: React.ElementType;
  type?: "separator";
  key?: string;
}

interface ExpandableTabsProps {
  tabs: Tab[];
  className?: string;
  activeColor?: string;
  onChange?: (index: number | null) => void;
  defaultSelected?: number | null;
}

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-primary",
  onChange,
  defaultSelected = null,
}: ExpandableTabsProps) {
  const [selected, setSelected] = React.useState<number | null>(defaultSelected);
  const outsideClickRef = React.useRef<HTMLDivElement>(null);

  const handleSelect = (index: number) => {
    setSelected(index);
    if (onChange) {
      onChange(index);
    }
  };

  const Separator = () => (
    <div className="mx-1 h-[24px] w-[1.2px] bg-[rgba(255,255,255,0.14)]" aria-hidden="true" />
  );

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "flex items-center gap-1.5 rounded-xl border p-1.5 shadow-sm overflow-x-auto scrollbar-hide",
        className
      )}
      style={{
        background: 'rgba(8, 14, 28, 0.72)',
        borderColor: 'rgba(255,255,255,0.18)',
        backdropFilter: 'blur(24px) saturate(145%)',
        WebkitBackdropFilter: 'blur(24px) saturate(145%)',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <Separator key={`separator-${index}`} />;
        }

        const Icon = tab.icon!;
        return (
          <motion.button
            key={tab.title || index}
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={selected === index}
            onClick={() => handleSelect(index)}
            transition={transition}
            className={cn(
              "relative flex items-center rounded-lg px-2 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors duration-300 flex-shrink-0 cursor-pointer",
              selected === index
                ? cn("bg-transparent", activeColor)
                : "text-slate-400 hover:text-white"
            )}
          >
            <Icon size={20} />
            <AnimatePresence initial={false}>
              {selected === index && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {tab.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
