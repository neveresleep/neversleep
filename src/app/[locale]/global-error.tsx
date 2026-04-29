'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          background:
            'linear-gradient(180deg, #E8F4FD 0%, #B8D9F8 50%, #D4EAFF 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily:
            "'Manrope', ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '20px',
            boxShadow:
              '0 8px 32px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.6) inset',
            maxWidth: '400px',
            width: '100%',
          }}
        >
          <p
            style={{
              fontSize: '80px',
              fontWeight: 'bold',
              lineHeight: 1,
              color: 'rgba(15,23,36,0.15)',
              marginBottom: '1rem',
            }}
          >
            :(
          </p>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#0F1724',
              marginBottom: '0.5rem',
            }}
          >
            Критическая ошибка
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: 'rgba(15,23,36,0.60)',
              marginBottom: '2rem',
            }}
          >
            Приложение не смогло загрузиться. Попробуй перезагрузить страницу.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              background: '#0F1724',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              fontFamily: 'inherit',
            }}
          >
            Перезагрузить
          </button>
        </div>
      </body>
    </html>
  );
}
