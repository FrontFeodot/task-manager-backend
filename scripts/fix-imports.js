const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');
const aliasMap = {
  '@controllers': 'controllers',
  '@middlewares': 'middlewares',
  '@common': 'common',
  '@models': 'models',
  '@routes': 'routes',
};

function resolvePath(fromFile, toPath) {
  let relative = path.relative(path.dirname(fromFile), toPath);
  relative = relative.replace(/\\/g, '/').replace(/\/\//g, '/');
  return relative.startsWith('.') ? relative : './' + relative;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const dir = path.dirname(filePath);

  // Заменяем все алиасы
  for (const [alias, realPath] of Object.entries(aliasMap)) {
    const regex = new RegExp(`(['"])${alias}/([^'"]+)(['"])`, 'g');

    content = content.replace(regex, (match, quote1, importPath, quote2) => {
      const fullImportPath = path
        .join(distPath, realPath, importPath)
        .replace(/\\/g, '/')
        .replace(/\/\//g, '/');

      const relativePath = resolvePath(filePath, fullImportPath);

      return `${quote1}${relativePath}${quote2}`;
    });
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Processed: ${path.relative(distPath, filePath)}`);
}

console.log('Starting import path fixing...');

// Рекурсивная обработка всех JS файлов
function processDirectory(directory) {
  const items = fs.readdirSync(directory);

  items.forEach((item) => {
    const itemPath = path.join(directory, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      processDirectory(itemPath);
    } else if (item.endsWith('.js')) {
      processFile(itemPath);
    }
  });
}

processDirectory(distPath);
console.log('✅ All imports fixed successfully');
