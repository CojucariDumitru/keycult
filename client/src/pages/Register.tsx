import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import { useAuth } from '../store/auth';
import { useToast } from '../store/toast';
import { Spinner } from '../components/ui';

export default function Register() {
  const { register } = useAuth();
  const push = useToast((s) => s.push);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { push('Password must be at least 8 characters', 'error'); return; }
    setLoading(true);
    try {
      const user = await register(name, email, password);
      push(`Welcome to KEYCULT, ${user.name.split(' ')[0]}!`);
      navigate('/', { replace: true });
    } catch (err) {
      push((err as Error).message || 'Registration failed', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="container-wide flex min-h-[80vh] items-center justify-center py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size={40} />
          <h1 className="mt-4 font-display text-2xl font-extrabold text-fg">Create your account</h1>
          <p className="mt-1 text-sm text-muted">Join KEYCULT in seconds</p>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6">
          <div><label className="label">Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Your name" /></div>
          <div><label className="label">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" /></div>
          <div><label className="label">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="At least 8 characters" /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? <Spinner className="h-4 w-4" /> : 'Create account'}</button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Already have an account? <Link to="/login" className="font-semibold text-brand hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
