import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// Explicitly specify the path to the request config
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  /* конфигурация */
  // output: 'standalone' - убрано, так как вызывает проблемы на Windows
  // и не требуется для большинства платформ деплоя (Vercel, Netlify и т.д.)
  // Если нужен для Docker, раскомментируйте эту строку и запускайте сборку в Linux окружении
};

export default withNextIntl(nextConfig);