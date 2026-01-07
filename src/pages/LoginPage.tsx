import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { useApp } from '../contexts/AppContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { ApiRequestError } from '../services/authService';
import logoImage from '../assets/28A9A4B0-D00A-4539-82A6-89A2130B5FAF.PNG';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else {
      setPassword(value);
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors['email'] = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors['email'] = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors['password'] = 'Password is required';
    }

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form first - this returns errors directly
    const validation = validateForm();
    
    if (!validation.isValid) {
      // Show specific validation errors in toast
      const errorFields = Object.keys(validation.errors);
      const errorMessages = errorFields.map(field => {
        const fieldLabel = field === 'email' ? 'Email' : 'Password';
        return `${fieldLabel}: ${validation.errors[field]}`;
      }).join('; ');
      
      toast.error('Please fix the errors in the form', {
        description: errorMessages,
        duration: 5000,
      });
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!', {
        description: 'You have successfully signed in.',
      });
      onNavigate('/');
    } catch (error: unknown) {
      let errorMessage = 'Please check your credentials and try again.';
      const fieldErrors: Record<string, string> = {};
      
      if (error instanceof ApiRequestError) {
        errorMessage = error.message;
        if (error.errors && Array.isArray(error.errors)) {
          error.errors.forEach((err: { field: string; message: string }) => {
            fieldErrors[err.field] = err.message;
          });
        } else {
          // Generic authentication error
          fieldErrors['email'] = 'Invalid email or password';
          fieldErrors['password'] = 'Invalid email or password';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
        fieldErrors['email'] = 'Invalid email or password';
        fieldErrors['password'] = 'Invalid email or password';
      }
      
      setErrors(fieldErrors);
      toast.error('Login failed', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-muted/50">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={logoImage} 
              alt="KGF Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Login Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Login Information</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`pl-10 ${errors['email'] ? 'border-destructive' : ''}`}
                      required
                    />
                  </div>
                  {errors['email'] && (
                    <p className="text-sm text-destructive mt-1">{errors['email']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`pl-10 pr-10 ${errors['password'] ? 'border-destructive' : ''}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors['password'] && (
                    <p className="text-sm text-destructive mt-1">{errors['password']}</p>
                  )}
                </div>
              </div>

              {/* Remember Me */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <label htmlFor="remember-me" className="text-sm leading-5">
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                className="w-full kgf-gradient text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>

              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('/register')}
                    className="text-primary hover:underline"
                  >
                    Create account
                  </button>
                </span>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};