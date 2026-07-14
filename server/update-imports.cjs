const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const replaceRules = [
  { from: /@\/shared\/domain\/repository/g, to: '@/core/domain' },
  { from: /@\/shared\/application\/interfaces/g, to: '@/core/application' },
  { from: /@\/shared\/infrastructure\/database/g, to: '@/infrastructure/database' },
  { from: /@\/shared\/infrastructure\/cache/g, to: '@/infrastructure/cache' },
  { from: /@\/shared\/middleware/g, to: '@/infrastructure/http/middleware' },
  { from: /@\/shared\/errors/g, to: '@/common/errors' },
  { from: /@\/shared\/constants/g, to: '@/common/constants' },
  { from: /@\/shared\/types/g, to: '@/common/types' },
  { from: /@\/shared\/utils/g, to: '@/common/utils' },
];

walkDir(path.join(__dirname, 'src'), (filePath) => {
  if (!filePath.endsWith('.ts')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const rule of replaceRules) {
    content = content.replace(rule.from, rule.to);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
});
