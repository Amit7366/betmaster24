// app/providers.tsx
"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store } from "@/redux/store";
import { persistor } from "@/redux/persistor";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
