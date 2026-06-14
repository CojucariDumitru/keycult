import { Link, useNavigate } from 'react-router-dom';
import { Package, LogOut, ShieldCheck, Mail, User as UserIcon, Heart } from 'lucide-react';
import { useAuth } from '../store/auth';
import { formatDate } from '../lib/format';

export default function Account() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <div className="container-wide max-w-3xl py-10">
      <h1 className="mb-8 font-display text-2xl font-extrabold text-fg md:text-3xl">My account</h1>

      <div className="card mb-6 flex items-center gap-4 p-6">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-brand/10 text-2xl font-extrabold text-brand">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-bold text-fg">{user.name}</h2>
          <p className="text-sm text-muted">{user.email}</p>
        </div>
        {isAdmin && <span className="badge ml-auto bg-brand/10 text-brand">Admin</span>}
      </div>

      <div className="card divide-y divide-line">
        <Row icon={<UserIcon size={16} />} label="Name" value={user.name} />
        <Row icon={<Mail size={16} />} label="Email" value={user.email} />
        <Row icon={<ShieldCheck size={16} />} label="Role" value={user.role} />
        <Row icon={<Package size={16} />} label="Member since" value={formatDate(user.createdAt)} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/account/orders" className="btn-primary"><Package size={16} /> My orders</Link>
        <Link to="/wishlist" className="btn-outline"><Heart size={16} /> Wishlist</Link>
        {isAdmin && <Link to="/admin" className="btn-outline"><ShieldCheck size={16} /> Admin panel</Link>}
        <button onClick={() => { logout(); navigate('/'); }} className="btn-ghost text-deal"><LogOut size={16} /> Sign out</button>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <span className="text-muted">{icon}</span>
      <span className="text-sm text-muted">{label}</span>
      <span className="ml-auto text-sm font-semibold text-fg">{value}</span>
    </div>
  );
}
