import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import esolutionsLogo from "@assets/esolutions-logo.png";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const emailParam = params.get('email');
    
    if (!tokenParam || !emailParam) {
      setIsValidToken(false);
      return;
    }

    setToken(tokenParam);
    setEmail(emailParam);
    verifyToken(tokenParam, emailParam);
  }, []);

  const verifyToken = async (tokenValue: string, emailValue: string) => {
    try {
      const response = await fetch(`/api/auth/verify-reset-token?token=${tokenValue}&email=${emailValue}`);
      const data = await response.json();
      
      if (response.ok && data.valid) {
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
        toast({
          title: "Invalid or Expired Link",
          description: data.message || "This password reset link is invalid or has expired.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsValidToken(false);
      toast({
        title: "Error",
        description: "Failed to verify reset link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please enter and confirm your new password",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password Reset Successful!",
          description: "Your password has been reset. Redirecting to login...",
        });
        
        setTimeout(() => {
          setLocation('/login');
        }, 1500);
      } else {
        toast({
          title: "Reset Failed",
          description: data.message || "Failed to reset password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-black dark text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-400 text-lg">Verifying link...</p>
        </div>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-black dark text-white relative overflow-hidden flex items-center justify-center">
        <div className="ai-particles fixed inset-0 z-0">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="ai-particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${8 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <Card className="w-full max-w-md mx-4 bg-gray-900/80 backdrop-blur-md border-red-500/30 shadow-2xl relative z-10">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-red-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-red-400">
              Invalid Reset Link
            </CardTitle>
            <CardDescription className="text-gray-300">
              This password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setLocation('/login')}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
              data-testid="button-back-to-login"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black dark text-white relative overflow-hidden flex items-center justify-center">
      <div className="ai-particles fixed inset-0 z-0">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="ai-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="absolute top-6 right-6 z-20">
        <img 
          src={esolutionsLogo} 
          alt="eSolutions" 
          className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity"
          data-testid="img-esolutions-logo"
        />
      </div>

      <Card className="w-full max-w-md mx-4 bg-gray-900/80 backdrop-blur-md border-cyan-500/30 shadow-2xl relative z-10">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <Lock className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold sentivox-text-gradient">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-gray-300">
            Enter your new password below
          </CardDescription>
          <div className="text-sm text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
            <p className="font-medium">{email}</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-200 flex items-center">
                <Lock className="h-4 w-4 mr-2 text-cyan-400" />
                New Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your new password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-cyan-500/30 text-white placeholder:text-gray-500 focus:border-cyan-400"
                data-testid="input-password"
                disabled={isLoading}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-200 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-cyan-400" />
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-gray-800 border-cyan-500/30 text-white placeholder:text-gray-500 focus:border-cyan-400"
                data-testid="input-confirm-password"
                disabled={isLoading}
                required
                minLength={8}
              />
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-sm text-gray-300">
              <p className="font-medium mb-2">Password Requirements:</p>
              <ul className="space-y-1 text-xs">
                <li className={password.length >= 8 ? 'text-green-400' : 'text-gray-400'}>
                  • At least 8 characters long
                </li>
                <li className={password && confirmPassword && password === confirmPassword ? 'text-green-400' : 'text-gray-400'}>
                  • Passwords match
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full glowing-button text-white font-semibold py-6 text-lg"
              disabled={isLoading || !password || !confirmPassword || password !== confirmPassword || password.length < 8}
              data-testid="button-reset-password"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Resetting Password...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Reset Password
                </span>
              )}
            </Button>

            <div className="text-center text-sm text-gray-400 pt-4">
              <p className="text-xs">Your password will be securely encrypted</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
