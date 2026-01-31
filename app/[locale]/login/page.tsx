"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  Github,
} from "lucide-react";
import { Form } from "@/components/ui/form";
import { Field, FieldControl, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const t = useTranslations("LoginPage");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = t("emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("emailInvalid");
    }

    if (!formData.password) {
      newErrors.password = t("passwordRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      // Здесь будет логика отправки данных на сервер
      setTimeout(() => {
        console.log("Форма отправлена:", formData);
        setLoading(false);
        // TODO: Добавить интеграцию с бэкендом
      }, 2000);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4 bg-background">
      <div className="z-10 w-full max-w-6xl">
        <div className="bg-card/50 overflow-hidden rounded-[40px] border shadow-2xl">
          <div className="grid min-h-[700px] lg:grid-cols-2">
            {/* Left Side - Branding */}
            <div className="brand-side relative m-4 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 p-12 text-foreground border border-border/50">
              <div className="text-lg font-semibold uppercase text-primary">
                Threat Analyzer
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex flex-col justify-center p-12 bg-card">
              <div className="mx-auto w-full max-w-md">
                <div className="mb-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-primary/10 p-3 border border-primary/20">
                      <LogIn className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-light uppercase">
                    {t("title")}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("description")}
                  </p>
                  <div className="text-muted-foreground mt-4 text-center text-sm">
                    {t("noAccount")}{" "}
                    <Link href="/register" className="text-primary hover:text-primary/80 font-medium">
                      {t("signUp")}
                    </Link>
                  </div>
                </div>

                {/* Social login buttons */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // TODO: Добавить логику входа через Google
                      console.log("Google login");
                    }}
                    aria-label={t("signInGoogle")}
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 48 48"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_17_40)">
                        <path
                          d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z"
                          fill="#34A853"
                        />
                        <path
                          d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z"
                          fill="#FBBC04"
                        />
                        <path
                          d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z"
                          fill="#EA4335"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_17_40">
                          <rect width="48" height="48" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                    <span className="ml-2">Google</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // TODO: Добавить логику входа через GitHub
                      console.log("GitHub login");
                    }}
                    aria-label={t("signInGitHub")}
                  >
                    <Github className="h-5 w-5" />
                    <span className="ml-2">GitHub</span>
                  </Button>
                </div>

                <div className="relative mb-6 text-center text-sm text-muted-foreground">
                  <div className="absolute inset-0 flex items-center">
                    <div className="border-border w-full border-t"></div>
                  </div>
                  <span className="relative px-2 bg-card">{t("orContinueWith")}</span>
                </div>

                <Form onSubmit={handleSubmit} className="space-y-6">
                  <Field name="email">
                    <FieldLabel className="uppercase text-xs">
                      <Mail className="h-4 w-4" />
                      {t("email")}
                    </FieldLabel>
                    <FieldControl
                      render={(props) => (
                        <Input
                          {...props}
                          type="email"
                          placeholder="example@mail.com"
                          required
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          aria-invalid={!!errors.email}
                        />
                      )}
                    />
                    {errors.email && <FieldError>{errors.email}</FieldError>}
                  </Field>

                  <Field name="password">
                    <FieldLabel className="uppercase text-xs">
                      <Lock className="h-4 w-4" />
                      {t("password")}
                    </FieldLabel>
                    <FieldControl
                      render={(props) => (
                        <div className="relative">
                          <Input
                            {...props}
                            type={showPassword ? "text" : "password"}
                            placeholder={t("passwordPlaceholder")}
                            required
                            value={formData.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            aria-invalid={!!errors.password}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      )}
                    />
                    {errors.password && <FieldError>{errors.password}</FieldError>}
                  </Field>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="ml-2">{t("signingIn")}</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        {t("signIn")}
                      </>
                    )}
                  </Button>
                </Form>

                <div className="text-muted-foreground mt-8 text-center text-sm">
                  <a href="#" className="text-primary hover:text-primary/80 font-medium">
                    {t("forgotPassword")}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

