
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import { SessionProvider } from "./context/SessionProvider";

  createRoot(document.getElementById("root")!).render(
    <SessionProvider>
      <App />
    </SessionProvider>
  );
  