import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button, Input, GlassCard } from '../../components/UI';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Rate limiting simulation (mock)
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <Link to="/" className="inline-block mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-white to-neutral-500 rounded-lg mx-auto" />
          </Link>
          <h2 className="text-3xl font-bold text-white">Welcome back</h2>
          <p className="mt-2 text-neutral-400">Sign in to continue creating</p>
        </div>

        <GlassCard className="border-white/10 bg-black/50 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 flex items-center gap-2">
                <AlertTriangle size={16} /> {error}
              </div>
            )}

            <Input 
              label="Email" 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-400">Password</label>
                <a href="#" className="text-xs text-white hover:underline">Forgot password?</a>
              </div>
              <Input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button className="w-full h-11" isLoading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-neutral-500">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-white font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </GlassCard>

        <p className="text-center text-xs text-neutral-600">
          For Admin Demo: use arbazb3yg@gmail.com / 12345678
        </p>
      </div>
    </div>
  );
}
