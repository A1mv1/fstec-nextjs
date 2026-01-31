"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Mail,
  Lock,
  Loader2,
  User,
  UserPlus,
  Github,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Field, FieldControl, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/password-input";
import { generatePassword } from "@/lib/utils";

export default function RegisterPage() {
  const t = useTranslations("RegisterPage");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
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

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    handleChange("password", newPassword);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("nameRequired");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("emailInvalid");
    }

    if (!formData.password) {
      newErrors.password = t("passwordRequired");
    } else if (formData.password.length < 8) {
      newErrors.password = t("passwordMinLength");
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

            {/* Right Side - Registration Form */}
            <div className="flex flex-col justify-center p-12 bg-card">
              <div className="mx-auto w-full max-w-md">
                <div className="mb-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-primary/10 p-3 border border-primary/20">
                      <UserPlus className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-light uppercase">
                    {t("title")}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("description")}
                  </p>
                </div>

                <Form onSubmit={handleSubmit} className="space-y-6">
                  <Field name="name">
                    <FieldLabel className="uppercase text-xs">
                      <User className="h-4 w-4" />
                      {t("name")}
                    </FieldLabel>
                    <FieldControl
                      render={(props) => (
                        <Input
                          {...props}
                          type="text"
                          placeholder={t("namePlaceholder")}
                          required
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          aria-invalid={!!errors.name}
                        />
                      )}
                    />
                    {errors.name && <FieldError>{errors.name}</FieldError>}
                  </Field>

                  <Field name="email">
                    <FieldLabel className="uppercase text-xs">
                      <Mail className="h-4 w-4" />
                      {t("email")}
                    </FieldLabel>
                    <FieldControl
                      render={(props) => (
                        <Input
                          required
                          {...props}
                          type="email"
                          placeholder="example@mail.com"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          aria-invalid={!!errors.email}
                        />
                      )}
                    />
                    {errors.email && <FieldError>{errors.email}</FieldError>}
                    <FieldDescription>
                      {t("emailPrivacy")}
                    </FieldDescription>
                  </Field>

                  <Field name="password">
                    <FieldLabel className="uppercase text-xs">
                      <Lock className="h-4 w-4" />
                      {t("password")}
                    </FieldLabel>
                    <FieldControl
                      render={(props) => (
                        <PasswordInput
                          {...props}
                          required
                          value={formData.password}
                          onChange={(e) => handleChange("password", e.target.value)}
                          placeholder={t("passwordPlaceholder")}
                          aria-invalid={!!errors.password}
                        />
                      )}
                    />
                    {errors.password && <FieldError>{errors.password}</FieldError>}
                    <FieldDescription className="text-sm text-muted-foreground">
                      {t("youCanGeneratePasswordPrefix")}{" "}
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-primary hover:text-primary/80 underline-offset-4 hover:underline font-normal text-sm"
                        onClick={handleGeneratePassword}
                        aria-label={t("generatePassword")}
                      >
                        {t("generatePassword")}
                      </Button>{" "}
                      {t("youCanGeneratePasswordSuffix")}
                    </FieldDescription>
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
                        <span className="ml-2">{t("creating")}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        {t("signUp")}
                      </>
                    )}
                  </Button>

                  <div className="relative text-center text-sm text-muted-foreground">
                    <div className="absolute inset-0 flex items-center">
                      <div className="border-border w-full border-t"></div>
                    </div>
                    <span className="relative px-2 bg-card">{t("orContinueWith")}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // TODO: Добавить логику входа через Google
                        console.log("Google login");
                      }}
                    >
                      <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        className="h-5 w-5"
                        alt="Google"
                      />
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
                    >
                      <Github className="h-5 w-5" />
                      <span className="ml-2">GitHub</span>
                    </Button>
                  </div>
                </Form>

                <div className="text-muted-foreground mt-8 text-center text-sm">
                  {t("haveAccount")}{" "}
                  <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                    {t("signIn")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
