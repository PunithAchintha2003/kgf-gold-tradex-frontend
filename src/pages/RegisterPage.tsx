import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { useApp } from '../contexts/AppContext';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, CircleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { ApiRequestError } from '../services/authService';
import logoImage from '../assets/28A9A4B0-D00A-4539-82A6-89A2130B5FAF.PNG';

interface RegisterPageProps {
  onNavigate: (path: string) => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address: string;
  agreeTerms: boolean;
  agreeMarketing: boolean;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useApp();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    agreeTerms: false,
    agreeMarketing: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleInputChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getPasswordStrength = (password: string): { label: string; score: number } => {
    if (!password) {
      return { label: 'No password entered', score: 0 };
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { label: 'Weak', score };
    if (score === 3 || score === 4) return { label: 'Medium', score };
    return { label: 'Strong', score };
  };

  const validateForm = (): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};

    if (!formData['name'].trim()) {
      newErrors['name'] = 'Full name is required';
    }

    if (!formData['email'].trim()) {
      newErrors['email'] = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData['email'])) {
      newErrors['email'] = 'Please enter a valid email address';
    }

    if (!formData['phone'].trim()) {
      newErrors['phone'] = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData['phone'])) {
      newErrors['phone'] = 'Please enter a valid phone number';
    }

    if (!formData['address'].trim()) {
      newErrors['address'] = 'Address is required';
    }

    if (!formData['password']) {
      newErrors['password'] = 'Password is required';
    } else if (formData['password'].length < 8) {
      newErrors['password'] = 'Password must be at least 8 characters long';
    }

    if (!formData['confirmPassword']) {
      newErrors['confirmPassword'] = 'Please confirm your password';
    } else if (formData['password'] !== formData['confirmPassword']) {
      newErrors['confirmPassword'] = 'Passwords do not match';
    }

    if (!formData['agreeTerms']) {
      newErrors['agreeTerms'] = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const visibleErrors = Object.fromEntries(
    Object.entries(errors).filter(([field]) => touched[field] || isLoading)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      address: true,
      agreeTerms: true,
    });
    
    // Validate form first - this returns errors directly
    const validation = validateForm();
    
    if (!validation.isValid) {
      // Show specific validation errors in toast
      const errorFields = Object.keys(validation.errors);
      const errorMessages = errorFields.map(field => {
        const fieldLabel = field === 'agreeTerms' ? 'Terms and conditions' : 
                          field === 'confirmPassword' ? 'Confirm password' :
                          field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
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
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address,
      });
      
      toast.success('Account created successfully!', {
        description: 'You have been automatically signed in.',
      });
      onNavigate('/');
    } catch (error: unknown) {
      // Handle API errors with field-specific messages
      let errorMessage = 'Please check your information and try again.';
      const fieldErrors: Record<string, string> = {};
      
      if (error instanceof ApiRequestError) {
        errorMessage = error.message;
        if (error.errors && Array.isArray(error.errors)) {
        // Map API field errors to form fields
        error.errors.forEach((err: { field: string; message: string }) => {
          fieldErrors[err.field] = err.message;
        });
        
        // Create a summary message
        const errorSummary = error.errors
          .map((err: { field: string; message: string }) => {
            const fieldLabel = err.field === 'email' ? 'Email' :
                             err.field === 'password' ? 'Password' :
                             err.field === 'name' ? 'Name' :
                             err.field === 'phone' ? 'Phone' :
                             err.field === 'address' ? 'Address' :
                             err.field.charAt(0).toUpperCase() + err.field.slice(1);
            return `${fieldLabel}: ${err.message}`;
          })
          .join('; ');
        
          errorMessage = errorSummary;
          setErrors(fieldErrors);
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
        // Generic error - try to extract field from message
        if (error.message.toLowerCase().includes('email')) {
          fieldErrors['email'] = error.message;
        } else if (error.message.toLowerCase().includes('password')) {
          fieldErrors['password'] = error.message;
        }
        setErrors(fieldErrors);
      }
      
      toast.error('Registration failed', {
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
          <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
          <p className="text-muted-foreground">
            Join Sri Lanka's premier gold marketplace
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Registration</CardTitle>
            <CardDescription>
              Create your account in less than 2 minutes. Required fields are marked with *
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {Object.keys(visibleErrors).length > 0 && (
                <Alert variant="destructive">
                  <CircleAlert />
                  <AlertTitle>Please review highlighted fields</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {Object.entries(visibleErrors).map(([field, message]) => (
                        <li key={field}>{message}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Personal Information */}
              <div className="space-y-4 rounded-lg border bg-card p-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="register-name" className="block text-sm font-medium mb-2">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="register-name"
                        autoComplete="name"
                        placeholder="Enter your full name"
                        value={formData['name']}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        onBlur={() => handleBlur('name')}
                        aria-invalid={Boolean(visibleErrors['name'])}
                        aria-describedby={visibleErrors['name'] ? 'name-error' : undefined}
                        className="pl-10"
                        required
                      />
                    </div>
                    {visibleErrors['name'] && (
                      <p id="name-error" className="text-sm text-destructive mt-1">{visibleErrors['name']}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="register-phone" className="block text-sm font-medium mb-2">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="register-phone"
                        autoComplete="tel"
                        placeholder="+94 XX XXX XXXX"
                        value={formData['phone']}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        onBlur={() => handleBlur('phone')}
                        aria-invalid={Boolean(visibleErrors['phone'])}
                        aria-describedby={visibleErrors['phone'] ? 'phone-error' : 'phone-hint'}
                        className="pl-10"
                        required
                      />
                    </div>
                    {!visibleErrors['phone'] && (
                      <p id="phone-hint" className="text-xs text-muted-foreground mt-1">
                        Include country code for faster verification.
                      </p>
                    )}
                    {visibleErrors['phone'] && (
                      <p id="phone-error" className="text-sm text-destructive mt-1">{visibleErrors['phone']}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      value={formData['email']}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      aria-invalid={Boolean(visibleErrors['email'])}
                      aria-describedby={visibleErrors['email'] ? 'register-email-error' : undefined}
                      className="pl-10"
                      required
                    />
                  </div>
                  {visibleErrors['email'] && (
                    <p id="register-email-error" className="text-sm text-destructive mt-1">{visibleErrors['email']}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="register-address" className="block text-sm font-medium mb-2">Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                    <Input
                      id="register-address"
                      autoComplete="street-address"
                      placeholder="Enter your full address"
                      value={formData['address']}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      onBlur={() => handleBlur('address')}
                      aria-invalid={Boolean(visibleErrors['address'])}
                      aria-describedby={visibleErrors['address'] ? 'address-error' : undefined}
                      className="pl-10"
                      required
                    />
                  </div>
                  {visibleErrors['address'] && (
                    <p id="address-error" className="text-sm text-destructive mt-1">{visibleErrors['address']}</p>
                  )}
                </div>
              </div>

              {/* Security */}
              <div className="space-y-4 rounded-lg border bg-card p-4">
                <h3 className="text-lg font-medium">Security</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="register-password" className="block text-sm font-medium mb-2">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Create a strong password (min. 8 characters)"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        onBlur={() => handleBlur('password')}
                        aria-invalid={Boolean(visibleErrors['password'])}
                        aria-describedby={visibleErrors['password'] ? 'password-error' : 'password-hint'}
                        className="pl-10 pr-10"
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
                    {!visibleErrors['password'] && (
                      <div id="password-hint" className="mt-2 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Strength: <span className="font-medium">{passwordStrength.label}</span>
                        </p>
                        <div className="h-1.5 rounded bg-muted overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              passwordStrength.score <= 2
                                ? 'bg-destructive'
                                : passwordStrength.score <= 4
                                  ? 'bg-yellow-500'
                                  : 'bg-green-600'
                            }`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {visibleErrors['password'] && (
                      <p id="password-error" className="text-sm text-destructive mt-1">{visibleErrors['password']}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="register-confirm-password" className="block text-sm font-medium mb-2">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="register-confirm-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        onBlur={() => handleBlur('confirmPassword')}
                        aria-invalid={Boolean(visibleErrors['confirmPassword'])}
                        aria-describedby={visibleErrors['confirmPassword'] ? 'confirm-password-error' : undefined}
                        className="pl-10"
                        required
                      />
                    </div>
                    {visibleErrors['confirmPassword'] && (
                      <p id="confirm-password-error" className="text-sm text-destructive mt-1">{visibleErrors['confirmPassword']}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-4 rounded-lg border bg-card p-4">
                <h3 className="text-lg font-medium">Consent</h3>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => {
                      handleInputChange('agreeTerms', checked === true);
                      setTouched(prev => ({ ...prev, agreeTerms: true }));
                    }}
                    aria-invalid={Boolean(visibleErrors['agreeTerms'])}
                    className={visibleErrors['agreeTerms'] ? 'border-destructive' : ''}
                  />
                  <label htmlFor="terms" className="text-sm leading-5">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:underline">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                  </label>
                </div>
                {visibleErrors['agreeTerms'] && (
                  <p className="text-sm text-destructive mt-1 ml-6">{visibleErrors['agreeTerms']}</p>
                )}

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="marketing"
                    checked={formData.agreeMarketing}
                    onCheckedChange={(checked) => handleInputChange('agreeMarketing', checked === true)}
                  />
                  <label htmlFor="marketing" className="text-sm leading-5">
                    Send me product updates and offers (optional)
                  </label>
                </div>
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                className="w-full kgf-gradient text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('/login')}
                    className="text-primary hover:underline"
                  >
                    Sign in here
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