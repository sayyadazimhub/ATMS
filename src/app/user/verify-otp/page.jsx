'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error('Missing email');
      router.push('/user/register');
    }
  }, [email, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/user/auth/verify-otp', { email, otp });
      toast.success('Email verified');
      window.location.href = '/user/dashboard';
      return;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        We sent a 6-digit OTP to <strong>{email}</strong>. Enter it below.
      </p>
      <div className="space-y-2">
        <Label htmlFor="otp">OTP</Label>
        <Input
          id="otp"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          required
          className="text-center text-lg tracking-[0.5em]"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Verifying…' : 'Verify email'}
      </Button>
    </form>
  );
}

export default function UserVerifyOtpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50/40 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter the OTP sent to your email (valid 10 minutes).
          </p>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-center text-muted-foreground">Loading…</p>}>
            <VerifyOtpForm />
          </Suspense>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/user/register" className="font-medium text-primary hover:underline">
              Use a different email
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
