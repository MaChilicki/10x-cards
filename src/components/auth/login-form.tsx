import { z } from "zod";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "./auth-layout";
import { AuthCard } from "./auth-card";
import { AuthForm } from "./auth-form";
import { logger } from "@/lib/services/logger.service";
import { useState, useEffect } from "react";
import { useAuth } from "./hooks/use-auth";
import { useNavigate } from "@/components/hooks/use-navigate";
import { toast } from "sonner";
import type { UseFormReturn } from "react-hook-form";

const loginSchema = z.object({
  email: z.string().min(1, "Email jest wymagany").email("Nieprawidłowy format email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshSession } = useAuth();
  const navigate = useNavigate();
  const [formInstance, setFormInstance] = useState<UseFormReturn<LoginFormValues> | null>(null);

  // Obsługa wygaśnięcia sesji
  useEffect(() => {
    const handleSessionExpired = () => {
      toast.error("Sesja wygasła. Zaloguj się ponownie.");
      navigate("/login");
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, [navigate]);

  const handleSubmit = async (data: LoginFormValues): Promise<void> => {
    try {
      setIsSubmitting(true);
      logger.info("Próba logowania użytkownika");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          if (result.error?.code === "INVALID_CREDENTIALS") {
            throw new Error("Nieprawidłowy email lub hasło");
          }
          window.dispatchEvent(new Event("session-expired"));
          return;
        }

        // Obsługa błędów walidacji
        if (response.status === 400) {
          if (result.error?.code === "VALIDATION_ERROR" && result.error?.details && formInstance) {
            Object.entries(result.error.details).forEach(([field, errors]) => {
              if (formInstance.formState.errors[field as keyof LoginFormValues]) {
                formInstance.setError(field as keyof LoginFormValues, {
                  message: Array.isArray(errors) ? errors[0] : String(errors),
                });
              }
            });
            throw new Error("Popraw błędy w formularzu");
          }

          if (result.error?.code === "SIGN_IN_ERROR") {
            throw new Error("Nieprawidłowy email lub hasło");
          }
        }

        // Obsługa błędów autoryzacji
        if (response.status === 403) {
          if (result.error?.code === "EMAIL_NOT_VERIFIED") {
            throw new Error("Email nie został zweryfikowany. Sprawdź swoją skrzynkę email.");
          }
          throw new Error("Brak dostępu. Sprawdź czy Twoje konto jest aktywne.");
        }

        // Obsługa innych błędów
        throw new Error(result.error?.message || "Nieprawidłowy email lub hasło");
      }

      if (!result.success) {
        throw new Error("Nieprawidłowy email lub hasło");
      }

      logger.info("Zalogowano użytkownika");

      try {
        // Odświeżamy sesję przed przekierowaniem
        await refreshSession();
        // Kontynuujemy niezależnie od wyniku odświeżania, jeśli mamy dane użytkownika z API

        // Sprawdzamy czy email jest zweryfikowany
        if (result.user && !result.user.email_verified) {
          navigate("/auth/verify-email");
          return;
        }

        // Przekierowujemy do strony głównej
        navigate("/");
      } catch (error) {
        logger.error("Błąd podczas odświeżania sesji", { error });

        // Jeśli błąd dotyczy braku sesji, ale mamy dane użytkownika z API, kontynuujemy
        if (error instanceof Error && error.message.includes("Auth session missing") && result.user) {
          logger.info("Kontynuuję mimo błędu sesji, ponieważ mamy dane użytkownika z API");

          // Sprawdzamy czy email jest zweryfikowany
          if (!result.user.email_verified) {
            navigate("/auth/verify-email");
            return;
          }

          // Przekierowujemy do strony głównej mimo błędu odświeżania
          navigate("/");
          return;
        }

        // Dla pozostałych błędów kontynuujemy mimo błędu odświeżania sesji
      }
    } catch (error) {
      logger.error("Błąd podczas logowania", error);

      // Obsługa błędów sieciowych
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        toast.error("Błąd połączenia z serwerem. Sprawdź swoje połączenie internetowe.");
        return;
      }

      // Obsługa innych błędów
      toast.error(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Logowanie"
        description="Zaloguj się do swojego konta"
        footer={
          <div className="text-sm text-muted-foreground">
            Nie masz konta?{" "}
            <a href="/register" className="text-primary hover:underline">
              Zarejestruj się
            </a>
          </div>
        }
      >
        <AuthForm<typeof loginSchema>
          schema={loginSchema}
          onSubmit={handleSubmit}
          submitButtonText="Zaloguj się"
          onFormReady={setFormInstance}
          warnOnUnsavedChanges={false}
          footer={
            <a href="/reset-password" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Nie pamiętasz hasła?
            </a>
          }
        >
          {(form) => (
            <>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  disabled={isSubmitting}
                  aria-label="Email"
                  aria-required="true"
                  aria-invalid={!!form.formState.errors.email}
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Hasło"
                  disabled={isSubmitting}
                  aria-label="Hasło"
                  aria-required="true"
                  aria-invalid={!!form.formState.errors.password}
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>
            </>
          )}
        </AuthForm>
      </AuthCard>
    </AuthLayout>
  );
}
