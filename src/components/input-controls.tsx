"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  className?: string;
  disabled?: boolean;
  format?: "currency" | "percent" | "number" | "months";
}

export function InputField({
  label,
  value,
  onChange,
  min = 0,
  max = 100000000,
  step = 1,
  prefix,
  suffix,
  tooltip,
  className,
  disabled = false,
  format = "number",
}: InputFieldProps) {
  const [localValue, setLocalValue] = useState(
    format === "months" ? String(Math.round(value)) : String(value)
  );

  useEffect(() => {
    setLocalValue(format === "months" ? String(Math.round(value)) : String(value));
  }, [value, format]);

  const handleBlur = () => {
    const val = parseFloat(localValue);
    if (!isNaN(val)) {
      onChange(Math.max(min, Math.min(max, val)));
    } else {
      setLocalValue(String(value));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-1.5">
        <Label className="label-caps text-on-surface-variant uppercase">
          {label}
        </Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-outline" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="relative group">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-data text-outline">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            "w-full input-well rounded-lg py-3 font-data text-on-surface outline-none transition-all",
            prefix ? "pl-10 pr-4" : "px-4",
            suffix ? "pr-10" : "",
            "focus:border-primary focus:ring-1 focus:ring-primary/20"
          )}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 label-caps text-outline text-[10px]">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  tooltip?: string;
  className?: string;
}

export function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = "%",
  tooltip,
  className,
}: SliderFieldProps) {
  return (
    <div className={cn("flex flex-col gap-4 py-2", className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Label className="label-caps text-on-surface-variant uppercase">
            {label}
          </Label>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-outline" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <span className="font-data text-primary">
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer slider-glow"
      />
      <div className="flex justify-between label-caps text-[10px] text-outline">
        <span>CONSERVATIVE</span>
        <span>AGGRESSIVE</span>
      </div>
    </div>
  );
}
