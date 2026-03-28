import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages에 배포할 때 저장소 이름으로 변경하세요
// 예: 저장소가 https://github.com/username/memo-app 이라면 "/memo-app/"
const REPO_NAME = "/memo-app/";

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === "production" ? REPO_NAME : "/",
});
