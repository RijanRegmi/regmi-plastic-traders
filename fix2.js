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

  // Fix recursive getImageUrl(path) injected by mistake
  if (content.includes('getImageUrl(path)')) {
    content = content.replace(/getImageUrl\(path\)/g, () => '`${API_BASE}${path}`');
  }

  if (original !== content) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
    updatedCount++;
  }
});

console.log('Total fixed:', updatedCount);
