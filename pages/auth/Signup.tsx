import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button, Input, GlassCard } from '../../components/UI';
import { AlertTriangle } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    await signup(name, email, password);
    navigate('/dashboard');
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-900/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <Link to="/" className="inline-block mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-white to-neutral-500 rounded-lg mx-auto" />
          </Link>
          <h2 className="text-3xl font-bold text-white">Create an account</h2>
          <p className="mt-2 text-neutral-400">Get 60 free credits when you join</p>
        </div>

        <GlassCard className="border-white/10 bg-black/50 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Full Name" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Creator"
            />

            <Input 
              label="Email" 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />

            <Input 
              label="Password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              minLength={8}
            />

            <Button className="w-full h-11" isLoading={loading}>
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-white font-medium hover:underline">
              Log in
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
