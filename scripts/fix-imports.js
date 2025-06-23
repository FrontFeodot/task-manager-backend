const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Заменяем алиасы на относительные пути
  content = content
    .replace(/from '@controllers\/(.*)';/g, "from './controllers/$1';")
    .replace(/from '@middlewares\/(.*)';/g, "from './middlewares/$1';")
    .replace(/from '@routes\/(.*)';/g, "from './routes/$1';")
    .replace(/from '@models\/(.*)';/g, "from './models/$1';")
    .replace(/from '@common\/(.*)';/g, "from './common/$1';");

  fs.writeFileSync(filePath, content, 'utf8');
}

function processDirectory(directory) {
  fs.readdirSync(directory).forEach(item => {
    const itemPath = path.join(directory, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      processDirectory(itemPath);
    } else if (itemPath.endsWith('.js')) {
      processFile(itemPath);
    }
  });
}

processDirectory(distPath);
console.log('Imports fixed successfully');