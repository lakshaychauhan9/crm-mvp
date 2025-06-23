"use client";

// Custom Stepper component for multi-step navigation in key setup/validation.
// Shows circles with checkmarks for completed steps, styled with Tailwind and shadcn.
import { cn } from "@/lib/utils";

interface StepperProps {
  currentStep: number;
  steps: { step: number; label: string }[];
  className?: string;
}

export function Stepper({ currentStep, steps, className }: StepperProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((item, index) => (
        <div key={item.step} className="flex items-center">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2 font-medium",
              item.step === currentStep
                ? "border-blue-600 bg-blue-600 text-white"
                : item.step < currentStep
                ? "border-green-600 bg-green-600 text-white"
                : "border-gray-300 bg-white text-gray-600"
            )}
          >
            {item.step < currentStep ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              item.step
            )}
          </div>
          <div className="ml-2 text-sm font-medium text-gray-600">
            {item.label}
          </div>
          {index < steps.length - 1 && (
            <div className="mx-2 h-px w-8 bg-gray-300" />
          )}
        </div>
      ))}
    </div>
  );
}
