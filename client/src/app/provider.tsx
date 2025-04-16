"use client";
import { ReactNode } from "react";
import StoreProvider from "../../state/redux";
import { Authenticator } from "@aws-amplify/ui-react";
import AuthProvider from "./(auth)/authProvider";
const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <StoreProvider>
      <Authenticator.Provider>
        <AuthProvider>{children}</AuthProvider>
      </Authenticator.Provider>
    </StoreProvider>
  );
};
export default Providers;
