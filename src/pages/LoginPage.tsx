import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { useApp, UserRole } from '../contexts/AppContext';
import { Mail, Lock, Eye, EyeOff, Shield, User, Store, Gavel, TrendingUp, Settings } from 'lucide-react';
import logoImage from '../assets/28A9A4B0-D00A-4539-82A6-89A2130B5FAF.PNG';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const demoPassword = import.meta.env['VITE_DEMO_PASSWORD'] || '';
  
  const demoAccounts = [
    {
      role: 'buyer' as UserRole,
      email: 'buyer@demo.com',
      password: demoPassword,
      name: 'John Customer',
      icon: User,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      description: 'Browse products, place orders, and use AR try-on'
    },
    {
      role: 'seller' as UserRole,
      email: 'seller@demo.com',
      password: demoPassword,
      name: 'Golden Palace Store',
      icon: Store,
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      description: 'Manage products, view orders, and track sales'
    },
    {
      role: 'pawnshop' as UserRole,
      email: 'pawnshop@demo.com',
      password: demoPassword,
      name: 'Heritage Pawnshop',
      icon: Gavel,
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      description: 'Create auctions, manage bids, and handle transactions'
    },
    {
      role: 'investor' as UserRole,
      email: 'investor@demo.com',
      password: demoPassword,
      name: 'Digital Gold Investor',
      icon: TrendingUp,
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      description: 'Trade digital gold and view investment analytics'
    },
    {
      role: 'admin' as UserRole,
      email: 'admin@demo.com',
      password: demoPassword,
      name: 'Platform Administrator',
      icon: Settings,
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      description: 'Full platform management and oversight'
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      onNavigate('/');
    } catch (_error) {
      alert('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (account: typeof demoAccounts[0]) => {
    setIsLoading(true);
    try {
      await login(account.email, account.password);
      // Navigate to appropriate dashboard
      switch (account.role) {
        case 'buyer':
          onNavigate('/dashboard/customer');
          break;
        case 'seller':
          onNavigate('/dashboard/seller');
          break;
        case 'pawnshop':
          onNavigate('/dashboard/pawnshop');
          break;
        case 'investor':
          onNavigate('/dashboard/investor');
          break;
        case 'admin':
          onNavigate('/dashboard/admin');
          break;
        default:
          onNavigate('/');
      }
    } catch (_error) {
      alert('Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-muted/50">
      <div className="container mx-auto px-4 max-w-6xl">
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
            Sign in to your account or try our demo accounts
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Login Form */}
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                <Button 
                  type="submit" 
                  className="w-full kgf-gradient text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <a href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </a>
                  <button
                    onClick={() => onNavigate('/register')}
                    className="text-sm text-primary hover:underline"
                  >
                    Create account
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demo Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Demo Accounts</span>
              </CardTitle>
              <CardDescription>
                Try different user roles to explore the platform features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {demoAccounts.map((account) => (
                  <div
                    key={account.role}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${account.color}`}>
                        <account.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{account.name}</span>
                          <Badge className={account.color}>
                            {account.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {account.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDemoLogin(account)}
                      disabled={isLoading}
                    >
                      Try Demo
                    </Button>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Demo Account Features
                    </p>
                    <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• All demo accounts use the configured demo password</li>
                      <li>• Full access to role-specific features</li>
                      <li>• Mock data and simulated interactions</li>
                      <li>• Switch between roles anytime</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};