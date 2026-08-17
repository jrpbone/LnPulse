import "./App.css";
import "../styles/CollectionInstances.css";
import AppProviders from "./AppProviders";
import AppRoutes from "./AppRoutes";
import AppShell from "./AppShell";

function App() {
  return (
    <AppProviders>
      <AppShell>
        <AppRoutes />
      </AppShell>
    </AppProviders>
  );
}

export default App;
