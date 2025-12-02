import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft, Send } from "lucide-react";
import esolutionsLogo from "@assets/esolutions-logo.png";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    const allowedDomains = [
      '@esolglobal.com',
      '@esol.com',
      '@otomashen.com'
    ];
    
    const emailLower = email.toLowerCase();
    return allowedDomains.some(domain => emailLower.endsWith(domain));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email Domain",
        description: "Please use an authorized email domain: @esolglobal.com, @esol.com, or @otomashen.com",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        toast({
          title: "Email Sent!",
          description: "If an account exists with this email, a password reset link has been sent.",
        });
      } else {
        toast({
          title: "Request Failed",
          description: data.message || "Failed to send reset email. Please try again.",
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

  if (emailSent) {
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
                <Mail className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold sentivox-text-gradient">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-gray-300">
              If an account exists with <strong>{email}</strong>, you'll receive a password reset link shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 text-sm text-gray-300">
              <p className="mb-2">📧 <strong>What's next?</strong></p>
              <ul className="space-y-1 text-xs">
                <li>• Check your inbox (and spam folder)</li>
                <li>• Click the reset link in the email</li>
                <li>• The link expires in 1 hour</li>
              </ul>
            </div>

            <Button
              onClick={() => setLocation('/login')}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
              data-testid="button-back-to-login"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>

            <div className="text-center">
              <button
                onClick={() => setEmailSent(false)}
                className="text-sm text-cyan-400 hover:text-cyan-300 underline"
                data-testid="link-send-again"
              >
                Send to a different email
              </button>
            </div>
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
              <Mail className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold sentivox-text-gradient">
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-gray-300">
            No worries! Enter your email and we'll send you a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-200 flex items-center">
                <Mail className="h-4 w-4 mr-2 text-cyan-400" />
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your.name@esolglobal.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-cyan-500/30 text-white placeholder:text-gray-500 focus:border-cyan-400"
                data-testid="input-email"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-gray-400">
                Use @esolglobal.com, @esol.com, or @otomashen.com
              </p>
            </div>

            <Button
              type="submit"
              className="w-full glowing-button text-white font-semibold py-6 text-lg"
              disabled={isLoading}
              data-testid="button-send-reset"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Send className="mr-2 h-5 w-5" />
                  Send Reset Link
                </span>
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setLocation('/login')}
                className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-2"
                data-testid="link-back-to-login"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <p className="text-sm text-gray-500">
          © 2025 Sentivox • AI-Powered Interview Analysis
        </p>
      </div>
    </div>
  );
}
