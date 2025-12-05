import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { useApp } from '../contexts/AppContext';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
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
  role: string;
  address: string;
  agreeTerms: boolean;
  agreeMarketing: boolean;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { t: _t } = useApp();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    address: '',
    agreeTerms: false,
    agreeMarketing: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.role) {
      newErrors.role = 'Please select an account type';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form', {
        description: 'Check all fields and try again.',
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate registration
    setTimeout(() => {
      toast.success('Account created successfully!', {
        description: 'You can now sign in with your credentials.',
      });
      setIsLoading(false);
      onNavigate('/login');
    }, 1500);
  };

  const roleOptions = [
    { value: 'buyer', label: 'Customer - Buy gold jewelry and products' },
    { value: 'seller', label: 'Gold Seller - Sell verified gold products' },
    { value: 'pawnshop', label: 'Pawnshop - Create auctions for gold items' },
    { value: 'investor', label: 'Digital Gold Investor - Trade digital gold' }
  ];

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
              Fill in your details to create your KGF account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`pl-10 ${errors.name ? 'border-destructive' : ''}`}
                        required
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="+94 XX XXX XXXX"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                        required
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Enter your full address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`pl-10 ${errors.address ? 'border-destructive' : ''}`}
                      required
                    />
                  </div>
                  {errors.address && (
                    <p className="text-sm text-destructive mt-1">{errors.address}</p>
                  )}
                </div>
              </div>

              {/* Account Type */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Type</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">I want to:</label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger className={errors['role'] ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select your account type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors['role'] && (
                    <p className="text-sm text-destructive mt-1">{errors['role']}</p>
                  )}
                </div>
              </div>

              {/* Security */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Security</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password (min. 8 characters)"
                        value={formData.password}
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

                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`pl-10 ${errors['confirmPassword'] ? 'border-destructive' : ''}`}
                        required
                      />
                    </div>
                    {errors['confirmPassword'] && (
                      <p className="text-sm text-destructive mt-1">{errors['confirmPassword']}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeTerms', checked)}
                    className={errors['agreeTerms'] ? 'border-destructive' : ''}
                  />
                  <label htmlFor="terms" className="text-sm leading-5">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:underline">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                  </label>
                </div>
                {errors['agreeTerms'] && (
                  <p className="text-sm text-destructive mt-1 ml-6">{errors['agreeTerms']}</p>
                )}

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="marketing"
                    checked={formData.agreeMarketing}
                    onCheckedChange={(checked) => handleInputChange('agreeMarketing', checked)}
                  />
                  <label htmlFor="marketing" className="text-sm leading-5">
                    I want to receive marketing communications and updates about new features
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