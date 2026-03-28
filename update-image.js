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

const dirsToScan = ['app', 'components', 'backend/src'];
let files = [];
dirsToScan.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    files = files.concat(walkSync(fullPath));
  }
});

let updatedCount = 0;

const oldStr1 = 'const getImageUrl = (path?: string) => path ? (path.startsWith("http") ? path : `${API_BASE}${path}`) : "";';
const oldStr2 = 'export const getImageUrl          = (_req: Request, url: string) => url;';

const newStr1 = `const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("regmi-plastic/")) return \`https://res.cloudinary.com/dkmbfnuch/image/upload/\${path}\`;
  return \`\${API_BASE}\${path.startsWith("/") ? "" : "/"}\${path}\`;
};`;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  if (content.includes(oldStr1)) {
    content = content.replace(oldStr1, newStr1);
  }

  // Handle case where path is already prefixed by a slash but missing hostname
  const uploadApiStr = `const getImageUrl = (path?: string) => path ? (path.startsWith("http") ? path : \`\${API_BASE}\${path.startsWith("/") ? "" : "/"}\${path}\`) : "";`;
  
  if (original !== content) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
    updatedCount++;
  }
});

console.log('Total fixed frontends:', updatedCount);
