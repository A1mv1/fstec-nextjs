import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* конфигурация */
  // output: 'standalone' - убрано, так как вызывает проблемы на Windows
  // и не требуется для большинства платформ деплоя (Vercel, Netlify и т.д.)
  // Если нужен для Docker, раскомментируйте эту строку и запускайте сборку в Linux окружении
};

export default nextConfig;