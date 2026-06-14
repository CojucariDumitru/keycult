import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-wide flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="font-display text-7xl font-extrabold text-brand-gradient">404</p>
      <h1 className="mt-4 font-display text-2xl font-extrabold text-fg">Page not found</h1>
      <p className="mt-2 max-w-sm text-muted">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary mt-7">Back home</Link>
    </div>
  );
}
