import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const { verifyEmail, error, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [isResending, setIsResending] = useState(false);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

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

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Email address not found');
      return;
    }

    setIsResending(true);
    try {
      await resendVerification(email);
      toast.success('Verification email sent', {
        description: 'Please check your inbox for the new verification link'
      });
    } catch (err) {
      console.error('Resend verification error:', err);
      toast.error('Failed to resend verification email', {
        description: 'Please try again later'
      });
    } finally {
      setIsResending(false);
    }
  };

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
            <div className="mt-4 space-y-2">
              {email && (
                <Button
                  variant="outline"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Resending verification email...
                    </>
                  ) : (
                    'Resend verification email'
                  )}
                </Button>
              )}
              <Button
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Return to Login
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
