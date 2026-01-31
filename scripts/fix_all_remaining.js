const fs = require('fs');
const path = require('path');

console.log('Fixing ALL remaining translations...\n');

// 1. Fix threats/page.tsx - "Подробнее" button
const threatsPath = path.join(__dirname, 'app', '[locale]', 'threats', 'page.tsx');
let threatsContent = fs.readFileSync(threatsPath, 'utf8');

threatsContent = threatsContent.replace(
  /<Badge variant="secondary">ФСТЭК: \{threat\.fstecId\}<\/Badge>/g,
  '<Badge variant="secondary">{tCommon("fstecId")}: {threat.fstecId}</Badge>'
);

threatsContent = threatsContent.replace(
  />\s*Подробнее\s*</g,
  '>{t("viewDetails")}<'
);

fs.writeFileSync(threatsPath, threatsContent, 'utf8');
console.log('✓ app/[locale]/threats/page.tsx updated');

// 2. Fix charts/page.tsx - "На главную" button
const chartsPath = path.join(__dirname, 'app', '[locale]', 'charts', 'page.tsx');
let chartsContent = fs.readFileSync(chartsPath, 'utf8');

chartsContent = chartsContent.replace(
  />\s*На главную\s*</g,
  '>{t("backToHome")}<'
);

fs.writeFileSync(chartsPath, chartsContent, 'utf8');
console.log('✓ app/[locale]/charts/page.tsx updated');

// 3. Fix cia-distribution-chart.tsx - "Нет данных" messages
const ciaDistPath = path.join(__dirname, 'components', 'charts', 'cia-distribution-chart.tsx');
let ciaDistContent = fs.readFileSync(ciaDistPath, 'utf8');

ciaDistContent = ciaDistContent.replace(
  /<p className="text-muted-foreground">Нет данных для отображения<\/p>/g,
  '<p className="text-muted-foreground">{t("noData")}</p>'
);

// Add useTranslations if not already there
if (!ciaDistContent.includes('const tCommon = useTranslations')) {
  ciaDistContent = ciaDistContent.replace(
    'const t = useTranslations(\'ChartsData\');',
    'const t = useTranslations(\'ChartsData\');\n  const tCommon = useTranslations(\'Common\');'
  );
}

fs.writeFileSync(ciaDistPath, ciaDistContent, 'utf8');
console.log('✓ components/charts/cia-distribution-chart.tsx updated');

// 4. Fix cia-combinations-chart.tsx - "Нет данных" messages + labels
const ciaCombPath = path.join(__dirname, 'components', 'charts', 'cia-combinations-chart.tsx');
let ciaCombContent = fs.readFileSync(ciaCombPath, 'utf8');

ciaCombContent = ciaCombContent.replace(
  /<p className="text-muted-foreground">Нет данных для отображения<\/p>/g,
  '<p className="text-muted-foreground">{tCommon("noData")}</p>'
);

// Fix color labels
ciaCombContent = ciaCombContent.replace(
  /label: "Цвет 1"/g,
  'label: "Color 1"'
);
ciaCombContent = ciaCombContent.replace(
  /label: "Цвет 2"/g,
  'label: "Color 2"'
);
ciaCombContent = ciaCombContent.replace(
  /label: "Цвет 3"/g,
  'label: "Color 3"'
);
ciaCombContent = ciaCombContent.replace(
  /label: "Цвет 4"/g,
  'label: "Color 4"'
);
ciaCombContent = ciaCombContent.replace(
  /label: "Цвет 5"/g,
  'label: "Color 5"'
);

// Add useTranslations if not already there
if (!ciaCombContent.includes('const tCommon = useTranslations')) {
  ciaCombContent = ciaCombContent.replace(
    'const t = useTranslations(\'ChartsData\');',
    'const t = useTranslations(\'ChartsData\');\n  const tCommon = useTranslations(\'Common\');'
  );
}

fs.writeFileSync(ciaCombPath, ciaCombContent, 'utf8');
console.log('✓ components/charts/cia-combinations-chart.tsx updated');

// 5. Fix protection-measures-chart.tsx - labels
const pmChartPath = path.join(__dirname, 'components', 'charts', 'protection-measures-chart.tsx');
let pmChartContent = fs.readFileSync(pmChartPath, 'utf8');

pmChartContent = pmChartContent.replace(
  /label: "С мерами защиты"/g,
  'label: "With measures"'
);
pmChartContent = pmChartContent.replace(
  /label: "Без мер защиты"/g,
  'label: "Without measures"'
);

fs.writeFileSync(pmChartPath, pmChartContent, 'utf8');
console.log('✓ components/charts/protection-measures-chart.tsx updated');

console.log('\n✅ All remaining translations fixed!');

