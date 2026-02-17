import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: string;
            }
          ) => void;
        };
      };
    };
  }
}

interface GoogleAuthButtonProps {
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  onCredential: (credential: string) => Promise<void> | void;
  disabled?: boolean;
}

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

export function GoogleAuthButton({ text = 'continue_with', onCredential, disabled = false }: GoogleAuthButtonProps) {
  const [error, setError] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setError('');
    const clientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

    if (!clientId) {
      setError('Google login não configurado. Defina VITE_GOOGLE_CLIENT_ID.');
      return;
    }

    const render = () => {
      if (!window.google?.accounts?.id || !containerRef.current) {
        setError('Não foi possível inicializar o Google Login.');
        return;
      }

      containerRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          const credential = String(response?.credential || '').trim();
          if (!credential) return;
          await onCredential(credential);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text,
        shape: 'rectangular',
        width: '360',
      });
    };

    if (window.google?.accounts?.id) {
      render();
      return;
    }

    const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', render, { once: true });
      return () => {
        existingScript.removeEventListener('load', render);
      };
    }

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = render;
    script.onerror = () => setError('Falha ao carregar Google Login.');
    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [onCredential, text]);

  return (
    <div className="space-y-2">
      <div className={disabled ? 'pointer-events-none opacity-60' : ''} ref={containerRef} />
      {error && <p className="text-xs text-gray-500">{error}</p>}
    </div>
  );
}
