import { useState } from 'react';

interface Props {
  src?: string;
  alt: string;
  name?: string;
  className?: string;
}

/** Branded fallback so a broken/missing image never shows a busted icon. */
function placeholder(name?: string) {
  const text = encodeURIComponent((name || 'KEYCULT').slice(0, 22));
  return `https://placehold.co/800x800/eef0f6/5838f0/png?text=${text}&font=montserrat`;
}

export default function ProductImage({ src, alt, name, className }: Props) {
  const [errored, setErrored] = useState(false);
  const finalSrc = !src || errored ? placeholder(name ?? alt) : src;
  return (
    <img
      src={finalSrc}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className={className}
      draggable={false}
    />
  );
}
