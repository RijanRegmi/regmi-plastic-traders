/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  if (dir.includes('node_modules') || dir.includes('.next') || dir.includes('.git')) return filelist;
  if (!fs.existsSync(dir)) return filelist;
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'app')).concat(walkSync(path.join(__dirname, 'components')));

let updatedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Inject helper just after API_BASE definition
  if (content.includes('API_BASE') && !content.includes('getImageUrl')) {
    content = content.replace(
      /\}?\)?\.replace\(\/\\\\?\/api\\\\?\$\/, ""\);/m,
      match => match + '\nconst getImageUrl = (path?: string) => path ? (path.startsWith("http") ? path : `${API_BASE}${path}`) : "";'
    );
  }

  // Replace usages:
  // src={`${API_BASE}${preview}`} => src={getImageUrl(preview)}
  content = content.replace(/src=\{\`\$\{API_BASE\}\$\{([^}]+)\}\`\}/g, 'src={getImageUrl($1)}');
  
  // Generic background URLs: url(`${API_BASE}${heroBgUrl}`)
  // Not quite, the code says:
  // const heroBgUrl = heroBgPath ? `${API_BASE}${heroBgPath}` : "";
  // We want to turn this into: const heroBgUrl = getImageUrl(heroBgPath);
  content = content.replace(/(\w+)\s*\?\s*\`\$\{API_BASE\}\$\{([^}]+)\}\`\s*:\s*""/g, 'getImageUrl($1)');

  // Cover generic: `${API_BASE}${varName}`
  content = content.replace(/\`\$\{API_BASE\}\$\{([^}]+)\}\`/g, 'getImageUrl($1)');

  if (original !== content) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
    updatedCount++;
  }
});

console.log('Total files updated:', updatedCount);
