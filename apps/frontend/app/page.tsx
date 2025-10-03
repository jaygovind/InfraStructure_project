'use client';

import { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

// 👇 prevent static pre-rendering issues
export const dynamic = "force-dynamic";

export default function Home() {
  const [health, setHealth] = useState<any>(null);
  const sessionHook = useSession(); // don't destructure directly
  const session = sessionHook?.data;

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    fetch(`${base}/health`)
      .then(r => r.json())
      .then(setHealth)
      .catch(console.error);
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>SwiftRide Frontend</h1>
      <p>Next.js 14 App is running.</p>
      <pre>{JSON.stringify(health, null, 2)}</pre>

      <div style={{ marginTop: 16 }}>
        {session ? (
          <>
            <p>Signed in as {session.user?.email}</p>
            <button onClick={() => signOut()}>Sign out</button>
          </>
        ) : (
          <button onClick={() => signIn()}>Sign in</button>
        )}
      </div>
    </main>
  );
}
