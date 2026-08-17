import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../core/auth";
import { ConfirmationProvider } from "../shared/confirmation/ConfirmationContext";

function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ConfirmationProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </ConfirmationProvider>
    </AuthProvider>
  );
}

export default AppProviders;
