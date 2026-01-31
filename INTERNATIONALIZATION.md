# Internationalization Implementation

## Overview

The application now supports bilingual operation (Russian/English) using `next-intl` library with locale-based routing.

## Implementation Details

### 1. Core Setup

- **Library**: `next-intl` v3.x
- **Routing**: Locale-based URLs (`/ru/...`, `/en/...`)
- **Default Locale**: Russian (`ru`)
- **Supported Locales**: Russian (`ru`), English (`en`)

### 2. File Structure

```
i18n/
├── routing.ts          # Locale routing configuration
├── request.ts          # Request-scoped i18n configuration
└── navigation.ts       # Locale-aware navigation wrappers

middleware.ts           # Locale detection and routing middleware (root level)

messages/
├── ru.json             # Russian UI translations
└── en.json             # English UI translations

public/data/
├── data.ru.json       # Russian database content
└── data.en.json       # English database content (partial)

app/
├── layout.tsx         # Minimal root layout
└── [locale]/
    ├── layout.tsx     # Locale-aware layout with NextIntlClientProvider
    ├── page.tsx       # Home page (translated)
    └── ...            # All other routes
```

### 3. Key Features

#### Automatic Locale Detection
- Middleware automatically detects and validates locale from URL
- Redirects to default locale if invalid locale is provided
- Preserves locale across navigation

#### Language Switcher
- Located in Settings Dialog (new "Change Language" tab)
- Switches between Russian and English
- Maintains current page when switching languages
- Visual feedback for current language

#### Translated Content

**UI Elements:**
- Navigation menu
- Page titles and descriptions
- Buttons and labels
- Help dialog content
- Settings dialog
- All static text

**Database Content:**
- Threat names and descriptions
- Tactical tasks
- Violator types
- Object types
- Protection measures

### 4. Usage

#### For Developers

**Using translations in Client Components:**
```typescript
'use client';
import { useTranslations, useLocale } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('Namespace');
  const locale = useLocale();
  
  return <div>{t('key')}</div>;
}
```

**Using translations in Server Components:**
```typescript
import { getTranslations } from 'next-intl/server';

export default async function MyPage() {
  const t = await getTranslations('Namespace');
  
  return <div>{t('key')}</div>;
}
```

**Navigation with locale:**
```typescript
import { Link, useRouter } from '@/i18n/navigation';

// Link component automatically includes locale
<Link href="/threats">Threats</Link>

// Router navigation
const router = useRouter();
router.push('/analysis');
```

**Loading data with locale:**
```typescript
import { getAllThreats } from '@/lib/data';
import { useLocale } from 'next-intl';

const locale = useLocale();
const threats = await getAllThreats(locale);
```

#### For Users

1. **Changing Language:**
   - Click Settings icon in header
   - Select "Change Language" / "Смена языка" tab
   - Choose desired language (Russian/English)
   - Page will reload with new language

2. **URL Structure:**
   - Russian: `https://example.com/ru/threats`
   - English: `https://example.com/en/threats`
   - Default: Redirects to `/ru/...`

### 5. Translation Files

#### UI Translations (`messages/*.json`)

Organized by namespace:
- `Common` - Shared strings
- `Navigation` - Nav links, breadcrumbs
- `HomePage` - Main page content
- `ThreatsPage` - Threats list page
- `AnalysisPage` - Analysis page
- `ProtectionMeasuresPage` - Protection measures
- `TacticalTasksPage` - Tactical tasks
- `ChartsPage` - Charts and analytics
- `SettingsDialog` - Settings dialog
- `HelpDialog` - Help content
- `Metadata` - Page titles and descriptions

#### Database Translations (`public/data/*.json`)

**Note**: The English database (`data.en.json`) contains a partial translation with 3 sample threats. Full translation of 1000+ threats requires:
- Professional translation services, OR
- AI-assisted batch translation, OR
- Gradual manual translation over time

The Russian database (`data.ru.json`) contains the complete original dataset.

### 6. Configuration Files

**`next.config.ts`:**
```typescript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
```

**`i18n/routing.ts`:**
```typescript
export const routing = defineRouting({
  locales: ['ru', 'en'],
  defaultLocale: 'ru'
});
```

### 7. Components Updated

The following components have been updated to support internationalization:
- `app/[locale]/layout.tsx` - Locale-aware layout with metadata
- `app/[locale]/page.tsx` - Home page with translations
- `components/header.tsx` - Navigation with translations
- `components/settings-dialog.tsx` - Settings with language switcher
- `lib/data.ts` - Data loader with locale support

### 8. Testing

To test the implementation:

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Test Russian (default):**
   - Navigate to `http://localhost:3000`
   - Should redirect to `http://localhost:3000/ru`
   - All content should be in Russian

3. **Test English:**
   - Navigate to `http://localhost:3000/en`
   - All UI content should be in English
   - Database content will show English for available translations

4. **Test Language Switcher:**
   - Click Settings icon
   - Go to "Change Language" tab
   - Switch between Russian and English
   - Verify URL changes and content updates

5. **Test Navigation:**
   - All links should preserve current locale
   - Browser back/forward should work correctly
   - Direct URL access should work for both locales

### 9. Future Enhancements

**Complete Database Translation:**
- Translate remaining 1000+ threats to English
- Add more languages (e.g., Chinese, Spanish)
- Implement translation management system

**Additional Features:**
- Auto-detect browser language preference
- Remember user's language choice in localStorage
- Add language selector in header (in addition to settings)
- Implement RTL support for Arabic/Hebrew

**Performance:**
- Implement lazy loading for large translation files
- Add translation caching strategies
- Optimize bundle size per locale

### 10. Troubleshooting

**Issue**: Page shows "404 Not Found"
- **Solution**: Ensure URL includes locale prefix (`/ru/` or `/en/`)

**Issue**: Translations not showing
- **Solution**: Check that translation key exists in `messages/{locale}.json`

**Issue**: Database content not in correct language
- **Solution**: Verify `data.{locale}.json` file exists and is properly formatted

**Issue**: Language switcher not working
- **Solution**: Check browser console for errors, ensure middleware is configured

### 11. Technical Notes

- **Middleware**: Runs on every request to handle locale detection
- **Caching**: Data files are cached per locale for performance
- **Type Safety**: Translation keys can be typed for better DX
- **SEO**: Each locale has its own metadata and URLs
- **Performance**: Messages are loaded per-request, cached by Next.js

## Conclusion

The application now fully supports Russian and English languages with:
- ✅ Locale-based routing
- ✅ UI translations
- ✅ Database translations (partial for English)
- ✅ Language switcher in settings
- ✅ Preserved locale across navigation
- ✅ Metadata localization
- ✅ Type-safe translations

All implementation follows Next.js 16 App Router best practices and next-intl recommendations.

