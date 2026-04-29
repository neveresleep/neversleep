'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';

interface AnimatedBackgroundProps {
  className?: string;
}

export default function AnimatedBackground({ className }: AnimatedBackgroundProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Before mount: show dark (avoids flash on dark-preferring systems)
  const isLight = mounted ? resolvedTheme === 'light' : false;

  return (
    <div aria-hidden="true" className={`fixed inset-0 -z-10 ${className ?? ''}`}>
      {/* Light */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isLight ? 'opacity-100' : 'opacity-0'}`}>
        <Image src="/bg-light.png" alt="" fill priority className="object-cover object-bottom" sizes="100vw" />
      </div>
      {/* Dark */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isLight ? 'opacity-0' : 'opacity-100'}`}>
        <Image src="/bg-dark.png" alt="" fill priority className="object-cover object-bottom" sizes="100vw" />
      </div>
    </div>
  );
}
