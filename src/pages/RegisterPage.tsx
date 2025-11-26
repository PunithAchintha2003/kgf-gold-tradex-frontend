import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { useApp } from '../contexts/AppContext';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import logoImage from '../assets/28A9A4B0-D00A-4539-82A6-89A2130B5FAF.PNG';

interface RegisterPageProps {
  onNavigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { t: _t } = useApp();
  const [formData, setFormData] = useState({
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!formData.agreeTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    
    // Simulate registration
    setTimeout(() => {
      alert('Account created successfully! Please login to continue.');
      onNavigate('/login');
      setIsLoading(false);
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
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="+94 XX XXX XXXX"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
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
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Enter your full address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Account Type */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Type</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">I want to:</label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger>
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
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
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
                        className="pl-10"
                        required
                      />
                    </div>
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
                  />
                  <label htmlFor="terms" className="text-sm leading-5">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:underline">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                  </label>
                </div>

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