import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MemoApp from "./MemoApp";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MemoApp />
  </StrictMode>
);
