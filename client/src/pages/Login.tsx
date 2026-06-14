import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import { useAuth } from '../store/auth';
import { useToast } from '../store/toast';
import { Spinner } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const push = useToast((s) => s.push);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      push(`Welcome back, ${user.name.split(' ')[0]}`);
      navigate(user.role === 'ADMIN' ? '/admin' : from, { replace: true });
    } catch (err) {
      push((err as Error).message || 'Login failed', 'error');
      setLoading(false);
    }
  };

  const fillDemo = (kind: 'admin' | 'customer') => {
    setEmail(kind === 'admin' ? 'admin@keycult.dev' : 'john@example.com');
    setPassword(kind === 'admin' ? 'Admin1234!' : 'Test1234!');
  };

  return (
    <div className="container-wide flex min-h-[80vh] items-center justify-center py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size={40} />
          <h1 className="mt-4 font-display text-2xl font-extrabold text-fg">Welcome back</h1>
          <p className="mt-1 text-sm text-muted">Sign in to your KEYCULT account</p>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6">
          <div><label className="label">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" /></div>
          <div><label className="label">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? <Spinner className="h-4 w-4" /> : 'Sign in'}</button>
        </form>

        <div className="mt-4 rounded-xl border border-line bg-surface2 p-4 text-xs text-muted">
          <p className="mb-2 font-bold text-fg">Demo accounts</p>
          <div className="flex gap-2">
            <button onClick={() => fillDemo('admin')} className="btn-outline flex-1 py-1.5 text-xs">Admin</button>
            <button onClick={() => fillDemo('customer')} className="btn-outline flex-1 py-1.5 text-xs">Customer</button>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          No account? <Link to="/register" className="font-semibold text-brand hover:underline">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}
