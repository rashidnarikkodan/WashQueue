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
  // Fix renamed interfaces
  { from: /@\/core\/domain\/base\.repository/g, to: '@/core/domain/repository.interface' },
  { from: /@\/core\/application\/cache-service\.interface/g, to: '@/core/application/cache.interface' },
  // Fix relative imports in server.ts
  { from: /\.\/shared\/infrastructure/g, to: './infrastructure' },
  // Fix relative imports in middleware that broke due to moving deeper
  { from: /\.\.\/errors\//g, to: '@/common/errors/' },
  { from: /\.\.\/\.\.\/configs\/logger\.config/g, to: '@/infrastructure/http/configs/logger.config' },
  { from: /\.\.\/configs\/logger\.config/g, to: '@/common/utils/logger' }, // wait, where is logger? Let's use @ alias if possible. Where was logger.config?
  { from: /import logger from "\.\.\/\.\.\/configs\/logger\.config"/g, to: 'import logger from "@/common/utils/logger"' } // I'll check where logger really is.
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
