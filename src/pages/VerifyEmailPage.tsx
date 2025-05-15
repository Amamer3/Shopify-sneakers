import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader, CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const { verifyEmail, error } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerificationStatus('error');
        return;
      }

      try {
        await verifyEmail(token);
        setVerificationStatus('success');
      } catch (err) {
        setVerificationStatus('error');
        console.error('Email verification error:', err);
      }
    };

    verifyToken();
  }, [token, verifyEmail]);

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="text-3xl font-bold mt-4 text-destructive">Invalid Verification Link</h1>
          <p className="text-muted-foreground mt-2">
            The email verification link is invalid or has expired.
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate('/login')}
          >
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto text-center">
        {verificationStatus === 'loading' && (
          <>
            <Loader className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h1 className="text-3xl font-bold mt-4">Verifying your email</h1>
            <p className="text-muted-foreground mt-2">
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {verificationStatus === 'success' && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h1 className="text-3xl font-bold mt-4 text-green-500">Email Verified!</h1>
            <p className="text-muted-foreground mt-2">
              Your email has been successfully verified.
            </p>
            <Button
              className="mt-4"
              onClick={() => navigate('/login')}
            >
              Continue to Login
            </Button>
          </>
        )}

        {verificationStatus === 'error' && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="text-3xl font-bold mt-4 text-destructive">Verification Failed</h1>
            <p className="text-muted-foreground mt-2">
              {error || 'Failed to verify your email address. The link may have expired.'}
            </p>
            <Button
              className="mt-4"
              onClick={() => navigate('/login')}
            >
              Return to Login
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
