
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<{
    firebaseApp: FirebaseApp | null;
    firestore: Firestore | null;
    auth: Auth | null;
  }>({
    firebaseApp: null,
    firestore: null,
    auth: null,
  });

  useEffect(() => {
    // هذه الدالة ستعمل فقط في المتصفح، مما يمنع أخطاء الخادم
    const instances = initializeFirebase();
    setServices(instances);
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp as any}
      firestore={services.firestore as any}
      auth={services.auth as any}
    >
      {children}
    </FirebaseProvider>
  );
}
