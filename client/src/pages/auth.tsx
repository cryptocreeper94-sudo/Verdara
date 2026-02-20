import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TreePine, Eye, EyeOff, ArrowRight, ArrowLeft, Shield, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least 1 capital letter")
    .regex(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/, "Must contain at least 1 special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage({ onBack }: { onBack?: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, register: registerUser } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
  });

  async function onLogin(values: LoginValues) {
    login.mutate(values, {
      onSuccess: () => {
        navigate("/");
      },
      onError: (error: Error) => {
        const msg = error.message.includes("401")
          ? "Invalid email or password"
          : "Login failed. Please try again.";
        toast({ title: "Login Failed", description: msg, variant: "destructive" });
      },
    });
  }

  async function onRegister(values: RegisterValues) {
    registerUser.mutate(
      { firstName: values.firstName, lastName: values.lastName, email: values.email, password: values.password },
      {
        onSuccess: () => {
          toast({
            title: "Account Created",
            description: "Check your email for a verification link.",
          });
          navigate("/");
        },
        onError: (error: Error) => {
          const msg = error.message.includes("409")
            ? "An account with this email already exists"
            : "Registration failed. Please try again.";
          toast({ title: "Registration Failed", description: msg, variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 flex flex-col justify-between p-8 lg:p-12">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/30 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-3 mb-12 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <TreePine className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">Verdara</span>
              </div>
              {onBack && (
                <Button
                  variant="ghost"
                  className="text-white/70 gap-2 text-sm"
                  onClick={onBack}
                  data-testid="button-back-to-landing"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
              )}
            </div>

            <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Your Complete
              <br />
              <span className="text-emerald-400">Outdoor Adventure</span>
              <br />
              Platform
            </h1>
            <p className="text-lg text-white/70 max-w-md leading-relaxed">
              AI-powered nature identification, trail discovery, trip planning,
              and a trusted marketplace - all in one ecosystem.
            </p>
          </div>

          <div className="relative z-10 hidden lg:flex flex-col gap-4 mt-auto">
            <div className="flex items-center gap-3 text-white/60">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span className="text-sm">TrustShield verified marketplace</span>
            </div>
            <div className="flex items-center gap-3 text-white/60">
              <TreePine className="w-5 h-5 text-emerald-400" />
              <span className="text-sm">184 features across 24 activity categories</span>
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground" data-testid="text-auth-title">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {mode === "login"
                  ? "Sign in to continue your adventure"
                  : "Join the Verdara ecosystem"}
              </p>
            </div>

            {mode === "login" ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            autoComplete="email"
                            placeholder="you@example.com"
                            data-testid="input-login-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="pr-10"
                              data-testid="input-login-password"
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 text-white"
                    disabled={login.isPending}
                    data-testid="button-login-submit"
                  >
                    {login.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="w-4 h-4 mr-2" />
                    )}
                    Sign In
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={registerForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="First"
                              data-testid="input-register-firstname"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Last"
                              data-testid="input-register-lastname"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            autoComplete="email"
                            placeholder="you@example.com"
                            data-testid="input-register-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="8+ chars, 1 capital, 1 special"
                              className="pr-10"
                              data-testid="input-register-password"
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              {...field}
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              className="pr-10"
                              data-testid="input-register-confirm-password"
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
                    Password requirements: 8 characters minimum, 1 capital letter, 1 special character.
                    This standard applies across the entire Trust Layer ecosystem.
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 text-white"
                    disabled={registerUser.isPending}
                    data-testid="button-register-submit"
                  >
                    {registerUser.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="w-4 h-4 mr-2" />
                    )}
                    Create Account
                  </Button>
                </form>
              </Form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  className="text-emerald-500 font-medium"
                  data-testid="button-toggle-auth-mode"
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground/50">
                SSO connection to Trust Layer ecosystem coming soon
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-border bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-muted-foreground">
            DarkWave Studios - Verdara Outdoor Recreation Platform
          </p>
          <a
            href="/admin"
            className="text-xs text-amber-500/70 hover:text-amber-400 transition-colors"
            data-testid="link-dev-dashboard"
          >
            Developer Dashboard
          </a>
        </div>
      </footer>
    </div>
  );
}
