'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
}

export default function AdminRegisterPage() {
  const router = useRouter();
  const [registerData, setRegisterData] = useState<RegisterData>({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Client-side validation
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Registration successful! Please login to continue.');
        router.push('/auth/login');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg mr-3">
              <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Create Account</h1>
          </div>
        </div>
        <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-foreground">
          Join the system
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground px-4">
          Create your admin account to get started
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Create Admin Account</CardTitle>
            <CardDescription className="text-sm">
              Fill in the details below to create your admin account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    className="pl-10 h-10 sm:h-9"
                    placeholder="Choose a username"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  3-50 characters, letters, numbers, underscores, and hyphens only
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="pl-10 pr-10 h-10 sm:h-9"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-sm hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-150"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10 h-10 sm:h-9"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground p-1"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 sm:h-9"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
              
              <div className="text-center">
                <Button variant="ghost" asChild className="h-10 sm:h-9">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
