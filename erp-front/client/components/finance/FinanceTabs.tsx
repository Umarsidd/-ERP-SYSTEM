import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Tab {
  key: string;
  label: string;
}

interface Props<T> {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
  right?: React.ReactNode;
}

export default function FinanceTabs<T>({ tabs, active, onChange, right }: Props<T>) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`px-4 py-2 rounded-md transition-all font-medium ${
              active === t.key ? "bg-primary text-primary-foreground shadow" : "bg-transparent text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>{right}</div>
    </div>
  );
}
