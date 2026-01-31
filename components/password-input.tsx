"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

interface PasswordInputProps extends React.ComponentProps<typeof Input> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PasswordInput({
  value,
  onChange,
  placeholder,
  className,
  ...props
}: PasswordInputProps) {
  const t = useTranslations("PasswordInput");
  const [isVisible, setIsVisible] = useState(false);

  const requirements = useMemo(
    () => [
      { regex: /.{8,}/, textKey: "minLength" },
      { regex: /[0-9]/, textKey: "hasNumber" },
      { regex: /[a-z]/, textKey: "hasLowercase" },
      { regex: /[A-Z]/, textKey: "hasUppercase" },
      { regex: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/, textKey: "hasSpecialChar" },
    ],
    []
  );

  const strength = useMemo(
    () =>
      requirements.map((req) => ({
        met: req.regex.test(value),
        text: t(req.textKey),
      })),
    [value, requirements, t]
  );

  const strengthScore = useMemo(
    () => strength.filter((req) => req.met).length,
    [strength]
  );

  const strengthColor = useMemo(() => {
    if (strengthScore === 0) return "bg-border";
    if (strengthScore <= 1) return "bg-red-500";
    if (strengthScore <= 2) return "bg-orange-500";
    if (strengthScore <= 3) return "bg-amber-500";
    if (strengthScore === 4) return "bg-yellow-500";
    return "bg-emerald-500";
  }, [strengthScore]);

  const strengthText = useMemo(() => {
    if (strengthScore === 0) return t("enterPassword");
    if (strengthScore <= 2) return t("weakPassword");
    if (strengthScore <= 3) return t("mediumPassword");
    return t("strongPassword");
  }, [strengthScore, t]);

  const getBackgroundColor = () => {
    if (strengthScore === 0) return "hsl(var(--border))";
    if (strengthScore <= 1) return "rgb(239 68 68)";
    if (strengthScore <= 2) return "rgb(249 115 22)";
    if (strengthScore <= 3) return "rgb(245 158 11)";
    if (strengthScore === 4) return "rgb(234 179 8)";
    return "rgb(16 185 129)";
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          {...props}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-describedby="password-description"
          className={`pr-10 ${className || ""}`}
        />
        <button
          type="button"
          aria-label={isVisible ? t("hidePassword") : t("showPassword")}
          aria-pressed={isVisible}
          className="text-muted-foreground/80 hover:text-foreground absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center outline-none transition"
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? (
            <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Eye size={16} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Password strength indicator */}
      <div
        className="bg-border mb-4 mt-3 h-1 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={strengthScore}
        aria-valuemin={0}
        aria-valuemax={5}
        aria-label={t("passwordStrength")}
      >
        <motion.div
          className="h-full"
          initial={false}
          animate={{
            width: `${(strengthScore / 5) * 100}%`,
            backgroundColor: getBackgroundColor(),
          }}
          transition={{
            width: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
            backgroundColor: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
          }}
        />
      </div>

      {/* Password strength description */}
      <p className="mb-2 text-sm font-medium" id="password-description">
        {strengthText}. {t("mustContain")}:
      </p>

      {/* Password requirements list */}
      <ul className="space-y-1.5" aria-label={t("passwordRequirements")}>
        {strength.map((req, index) => (
          <li key={index} className="flex items-center gap-2">
            {req.met ? (
              <Check className="text-emerald-500" size={16} aria-hidden="true" />
            ) : (
              <X className="text-muted-foreground/80" size={16} aria-hidden="true" />
            )}
            <span
              className={`text-xs ${
                req.met ? "text-emerald-500" : "text-muted-foreground/80"
              }`}
            >
              {req.text}
            </span>
            <span className="sr-only">
              {req.met ? t("requirementMet") : t("requirementNotMet")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

