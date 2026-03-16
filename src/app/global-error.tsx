'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error('[GlobalError]', error)
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Georgia, serif', background: '#f5f0e8', margin: 0 }}>
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px', padding: '0 24px' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>天界</div>
            <h2 style={{ fontSize: '22px', color: '#1a1a1a', marginBottom: '12px' }}>Something went wrong</h2>
            <p style={{ color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
              We hit an unexpected error. Please try again.
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: '10px 24px',
                background: '#c0392b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
