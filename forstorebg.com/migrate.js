const fs = require('fs');
const path = require('path');

const mirrorsDir = path.join(__dirname, 'mirrors', 'en');
const srcDir = path.join(__dirname, 'src');

const routeMap = {
  'index.html': { out: 'index.md', titleDefault: 'ForStoreBG - Warehouse Solutions', descDefault: 'Warehouse and logistics solutions.' },
  'kontakti/index.html': { out: 'contact/index.md', titleDefault: 'Contact Us', descDefault: 'Get in touch with ForStoreBG.' },
  'za-nas/index.html': { out: 'about/index.md', titleDefault: 'About Us', descDefault: 'Learn more about ForStoreBG.' },
  'uslugi/index.html': { out: 'services/index.md', titleDefault: 'Services', descDefault: 'Our warehouse services.' },
  'proekti/index.html': { out: 'projects/index.md', titleDefault: 'Projects', descDefault: 'Our successfully implemented projects.' },
  'obshti-uslovia/index.html': { out: 'terms/index.md', titleDefault: 'Terms and Conditions', descDefault: 'General conditions.' },
  'politika-za-poveritelnost/index.html': { out: 'privacy/index.md', titleDefault: 'Privacy Policy', descDefault: 'Our privacy policy.' },
  'politika-za-biskvitki/index.html': { out: 'cookies/index.md', titleDefault: 'Cookie Policy', descDefault: 'Our cookie policy.' },
  'oborudvane/index.html': { out: 'equipment/index.md', titleDefault: 'Equipment', descDefault: 'Warehouse equipment.' },
  
  // 23 individual equipment subpages
  'oborudvane/avtonomni-mobilni-roboti/index.html': { out: 'equipment/autonomous-mobile-robots/index.md' },
  'oborudvane/elektricheski-paletni-kolichki/index.html': { out: 'equipment/electric-pallet-trucks/index.md' },
  'oborudvane/elektrokari/index.html': { out: 'equipment/electric-forklifts/index.md' },
  'oborudvane/gravitachna-sistema-za-kashoni-i-kutii/index.html': { out: 'equipment/gravity-system-for-cartons-and-boxes/index.md' },
  'oborudvane/kompaktna-skladova-sistema/index.html': { out: 'equipment/compact-storage-system/index.md' },
  'oborudvane/konzolni-stelazhi/index.html': { out: 'equipment/cantilever-racks/index.md' },
  'oborudvane/mezzanine-stelazhi/index.html': { out: 'equipment/mezzanine-type-racks/index.md' },
  'oborudvane/mobilna-arhivna-sistema/index.html': { out: 'equipment/mobile-archive-system/index.md' },
  'oborudvane/motokari-i-gazokari/index.html': { out: 'equipment/forklifts-and-gas-trucks/index.md' },
  'oborudvane/nozhichni-platformi/index.html': { out: 'equipment/scissor-platforms/index.md' },
  'oborudvane/pallet-flow-racking/index.html': { out: 'equipment/pallet-flow-racking/index.md' },
  'oborudvane/prohodna-stelazhna-sistema/index.html': { out: 'equipment/walk-through-shelving-system/index.md' },
  'oborudvane/push-back-pallet-racking/index.html': { out: 'equipment/push-back-pallet-racking/index.md' },
  'oborudvane/rachni-paletni-kolichki/index.html': { out: 'equipment/manual-pallet-trucks/index.md' },
  'oborudvane/radio-shuttle-racking-system/index.html': { out: 'equipment/radio-shuttle-racking-system/index.md' },
  'oborudvane/rezervni-chasti-i-konsumativi/index.html': { out: 'equipment/spare-parts-and-consumables/index.md' },
  'oborudvane/richtraci/index.html': { out: 'equipment/reach-trucks/index.md' },
  'oborudvane/samonoseshti-skladove/index.html': { out: 'equipment/self-supporting-warehouses/index.md' },
  'oborudvane/stakeri/index.html': { out: 'equipment/stackers/index.md' },
  'oborudvane/standardna-paletna-sistema/index.html': { out: 'equipment/standard-pallet-system/index.md' },
  'oborudvane/stelazhi-za-rachno-obsluzhvane/index.html': { out: 'equipment/racks-for-manual-service/index.md' },
  'oborudvane/super-123/index.html': { out: 'equipment/super-123/index.md' },
  'oborudvane/targovskoto-oborudvane/index.html': { out: 'equipment/commercial-equipment/index.md' }
};

const equipmentSubMap = {
  'avtonomni-mobilni-roboti': 'autonomous-mobile-robots',
  'elektricheski-paletni-kolichki': 'electric-pallet-trucks',
  'elektrokari': 'electric-forklifts',
  'gravitachna-sistema-za-kashoni-i-kutii': 'gravity-system-for-cartons-and-boxes',
  'kompaktna-skladova-sistema': 'compact-storage-system',
  'konzolni-stelazhi': 'cantilever-racks',
  'mezzanine-stelazhi': 'mezzanine-type-racks',
  'mobilna-arhivna-sistema': 'mobile-archive-system',
  'motokari-i-gazokari': 'forklifts-and-gas-trucks',
  'nozhichni-platformi': 'scissor-platforms',
  'pallet-flow-racking': 'pallet-flow-racking',
  'prohodna-stelazhna-sistema': 'walk-through-shelving-system',
  'push-back-pallet-racking': 'push-back-pallet-racking',
  'rachni-paletni-kolichki': 'manual-pallet-trucks',
  'radio-shuttle-racking-system': 'radio-shuttle-racking-system',
  'rezervni-chasti-i-konsumativi': 'spare-parts-and-consumables',
  'richtraci': 'reach-trucks',
  'samonoseshti-skladove': 'self-supporting-warehouses',
  'stakeri': 'stackers',
  'standardna-paletna-sistema': 'standard-pallet-system',
  'stelazhi-za-rachno-obsluzhvane': 'racks-for-manual-service',
  'super-123': 'super-123',
  'targovskoto-oborudvane': 'commercial-equipment'
};

function translateUrl(url, currentFile) {
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) {
    return url;
  }
  
  let [pathPart, hashPart] = url.split('#');
  const hash = hashPart ? '#' + hashPart : '';
  
  if (!pathPart || pathPart === '.' || pathPart === './') {
    return '/' + hash;
  }
  
  const currentDir = currentFile.includes('/') ? currentFile.substring(0, currentFile.lastIndexOf('/')) : '';
  
  let parts;
  if (pathPart.startsWith('/')) {
    parts = pathPart.split('/').filter(Boolean);
  } else {
    const baseParts = currentDir ? currentDir.split('/') : [];
    const relParts = pathPart.split('/');
    for (const part of relParts) {
      if (part === '.' || part === '') continue;
      if (part === '..') {
        baseParts.pop();
      } else {
        baseParts.push(part);
      }
    }
    parts = baseParts;
  }
  
  const resolvedPath = parts.join('/');
  
  if (resolvedPath === 'index.html' || resolvedPath === '') {
    return '/' + hash;
  }
  if (resolvedPath === 'kontakti' || resolvedPath === 'kontakti/index.html') {
    return '/contact/' + hash;
  }
  if (resolvedPath === 'za-nas' || resolvedPath === 'za-nas/index.html') {
    return '/about/' + hash;
  }
  if (resolvedPath === 'uslugi' || resolvedPath === 'uslugi/index.html') {
    return '/services/' + hash;
  }
  if (resolvedPath === 'proekti' || resolvedPath === 'proekti/index.html') {
    return '/projects/' + hash;
  }
  if (resolvedPath === 'obshti-uslovia' || resolvedPath === 'obshti-uslovia/index.html') {
    return '/terms/' + hash;
  }
  if (resolvedPath === 'politika-za-poveritelnost' || resolvedPath === 'politika-za-poveritelnost/index.html') {
    return '/privacy/' + hash;
  }
  if (resolvedPath === 'politika-za-biskvitki' || resolvedPath === 'politika-za-biskvitki/index.html') {
    return '/cookies/' + hash;
  }
  if (resolvedPath === 'oborudvane' || resolvedPath === 'oborudvane/index.html') {
    return '/equipment/' + hash;
  }
  
  const oborudvanePrefix = 'oborudvane/';
  if (resolvedPath.startsWith(oborudvanePrefix)) {
    let subpath = resolvedPath.substring(oborudvanePrefix.length);
    if (subpath.endsWith('/index.html')) {
      subpath = subpath.substring(0, subpath.length - 11);
    } else if (subpath.endsWith('/')) {
      subpath = subpath.substring(0, subpath.length - 1);
    }
    
    const mapped = equipmentSubMap[subpath];
    if (mapped) {
      return `/equipment/${mapped}/` + hash;
    }
  }
  
  return '/' + resolvedPath + hash;
}

function translateAssetUrl(url, currentFile) {
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('//')) {
    return url;
  }
  
  const currentDir = currentFile.includes('/') ? currentFile.substring(0, currentFile.lastIndexOf('/')) : '';
  
  let parts;
  if (url.startsWith('/')) {
    parts = url.split('/').filter(Boolean);
  } else {
    const baseParts = currentDir ? currentDir.split('/') : [];
    const relParts = url.split('/');
    for (const part of relParts) {
      if (part === '.' || part === '') continue;
      if (part === '..') {
        baseParts.pop();
      } else {
        baseParts.push(part);
      }
    }
    parts = baseParts;
  }
  
  const resolvedPath = parts.join('/');
  return '/' + resolvedPath;
}

function migratePage(fileKey, config) {
  const srcPath = path.join(mirrorsDir, fileKey);
  const destPath = path.join(srcDir, config.out);
  
  if (!fs.existsSync(srcPath)) {
    console.warn(`[WARNING] Source file not found: ${srcPath}`);
    return;
  }
  
  const html = fs.readFileSync(srcPath, 'utf8');
  
  // Extract Title and Description
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  let title = titleMatch ? titleMatch[1].trim() : config.titleDefault || '';
  title = title.replace(/\s*\|\s*FORSTORBG/i, '');
  title = title.replace(/\s*\|\s*ForstoreBG/i, '');
  title = title.replace(/\s*\|\s*Лого\s*Форстор\s*БГ/i, '');
  title = title.replace(/\s*\|\s*FORSTORE\s*BG/i, '');
  
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i) || html.match(/<meta\s+content="([^"]+)"\s+name="description"/i);
  const description = descMatch ? descMatch[1].trim() : config.descDefault || title || '';
  
  // Extract content inside <main>...</main>
  const mainStartTagIndex = html.indexOf('<main');
  if (mainStartTagIndex === -1) {
    console.error(`[ERROR] <main> tag not found in ${srcPath}`);
    return;
  }
  
  const mainContentStartIndex = html.indexOf('>', mainStartTagIndex) + 1;
  const mainEndTagIndex = html.lastIndexOf('</main>');
  if (mainEndTagIndex === -1) {
    console.error(`[ERROR] </main> tag not found in ${srcPath}`);
    return;
  }
  
  let mainContent = html.substring(mainContentStartIndex, mainEndTagIndex);
  
  // Strip Next.js comments or hydration markings
  mainContent = mainContent.replace(/<!--\$-->/g, '').replace(/<!--\/\$-->/g, '');
  mainContent = mainContent.replace(/<!-- -->/g, '');
  
  // Rewrite internal links and asset links using the regex matcher
  let updatedContent = mainContent.replace(/(href|src|srcset|data-src)=([\x22'])([^\x22']+)\2/g, (match, attr, quote, val) => {
    if (attr === 'href') {
      const translated = translateUrl(val, fileKey);
      return `${attr}=${quote}${translated}${quote}`;
    } else if (attr === 'srcset') {
      const parts = val.split(',').map(part => {
        const trimmed = part.trim();
        const spaceIdx = trimmed.indexOf(' ');
        if (spaceIdx === -1) {
          return translateAssetUrl(trimmed, fileKey);
        } else {
          const u = trimmed.substring(0, spaceIdx);
          const size = trimmed.substring(spaceIdx);
          return translateAssetUrl(u, fileKey) + size;
        }
      });
      return `${attr}=${quote}${parts.join(', ')}${quote}`;
    } else {
      const translated = translateAssetUrl(val, fileKey);
      return `${attr}=${quote}${translated}${quote}`;
    }
  });
  
  // Compile EJS/YAML front matter
  const escapedTitle = title.replace(/"/g, '\\"');
  const escapedDesc = description.replace(/"/g, '\\"');
  const output = `---
layout: layouts/base.ejs
title: "${escapedTitle}"
description: "${escapedDesc}"
---

${updatedContent}
`;
  
  // Create destination directory if not exists
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  fs.writeFileSync(destPath, output, 'utf8');
  console.log(`[SUCCESS] Migrated ${fileKey} -> src/${config.out}`);
}

// Start migration of all registered routes
console.log('Starting migration from mirrors/en/ to src/ ...');
for (const [fileKey, config] of Object.entries(routeMap)) {
  migratePage(fileKey, config);
}
console.log('Migration complete!');
