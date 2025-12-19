// app/providers.tsx
"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store } from "@/redux/store";
import { persistor } from "@/redux/persistor";
import { useEffect } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {

   useEffect(() => {
    const bootstrap = async () => {
      // simulate real boot tasks
      await new Promise((r) => setTimeout(r, 300));

      // ✅ Manually close preloader
      // @ts-ignore
      window.hideAppPreloader?.();
    };

    bootstrap();
  }, []);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
