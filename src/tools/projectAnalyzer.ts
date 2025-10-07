import * as fs from 'fs';
import * as path from 'path';

const EXCLUDED_DIRS = ['node_modules', 'venv', '.git', '__pycache__', '.vscode'];

export async function analyzeFolder(
  rootPath: string, 
  maxDepth: number = Infinity
): Promise<string> {
  const rootName = path.basename(rootPath);
  let result = rootName + '\n';
  
  try {
    result += await analyzeFolderRecursive(rootPath, '', 0, maxDepth);
    return result;
  } catch (error) {
    console.error('Error analyzing folder:', error);
    throw error;
  }
}


async function analyzeFolderRecursive(
  currentPath: string,
  prefix: string,
  depth: number,
  maxDepth: number
): Promise<string> {
  if (depth >= maxDepth) {
    return '';
  }

  let result = '';
  
  try {
    const items = fs.readdirSync(currentPath);
    
    const sortedItems = items.sort((a, b) => {
      const aIsDir = fs.statSync(path.join(currentPath, a)).isDirectory();
      const bIsDir = fs.statSync(path.join(currentPath, b)).isDirectory();
      
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });
    
    
    for (let i = 0; i < sortedItems.length; i++) {
      const item = sortedItems[i];
      const itemPath = path.join(currentPath, item);
      const isLastItem = i === sortedItems.length - 1;
      
      try {
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          if (EXCLUDED_DIRS.includes(item)) {
            continue;
          }
          
          const branchGraphic = isLastItem ? '└── ' : '├── ';
          result += `${prefix}${branchGraphic}${item}/\n`;
          
          const newPrefix = prefix + (isLastItem ? '    ' : '│   ');
          result += await analyzeFolderRecursive(itemPath, newPrefix, depth + 1, maxDepth);
        } else {
          const branchGraphic = isLastItem ? '└── ' : '├── ';
          result += `${prefix}${branchGraphic}${item}\n`;
        }
      } catch (error) {
        console.error(`Error accessing ${itemPath}:`, error);
      }
    }
    
    return result;
  } catch (error) {
    console.error(`Error reading directory ${currentPath}:`, error);
    return '';
  }
}

export async function createAnnotatedStructure(
  rootPath: string,
  annotations: Record<string, string> = {}
): Promise<string> {
  const structure = await analyzeFolder(rootPath);
  const lines = structure.split('\n');
  
  const annotatedLines = lines.map(line => {
    const match = line.match(/[└├]── (.+)$/);
    if (match) {
      const itemName = match[1];
      if (annotations[itemName]) {
        return `${line} --> ${annotations[itemName]}`;
      }
    }
    return line;
  });
  
  return annotatedLines.join('\n');
}