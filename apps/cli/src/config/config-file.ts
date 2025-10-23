import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ConfigFile } from './types.js';

const CONFIG_FILE_NAMES = [
  'flycli.config.json',
  'flycli.config.js',
  '.flyclirc',
  '.flyclirc.json',
];

export function findConfigFile(directory: string): string | null {
  for (const fileName of CONFIG_FILE_NAMES) {
    const configPath = resolve(directory, fileName);
    if (existsSync(configPath)) {
      return configPath;
    }
  }
  return null;
}

export function loadConfigFile(configPath: string): ConfigFile {
  try {
    const fileContent = readFileSync(configPath, 'utf-8');
    
    // Handle JSON files
    if (configPath.endsWith('.json') || configPath.includes('.rc')) {
      return JSON.parse(fileContent) as ConfigFile;
    }
    
    // Handle JS files (basic support)
    if (configPath.endsWith('.js')) {
      // For now, treat JS files as JSON
      // In a full implementation, you'd use dynamic import
      return JSON.parse(fileContent) as ConfigFile;
    }
    
    return {};
  } catch (error) {
    console.error(`Error loading config file ${configPath}:`, error);
    return {};
  }
}

export function getConfigFromFile(directory: string): ConfigFile {
  const configPath = findConfigFile(directory);
  if (!configPath) {
    return {};
  }
  
  return loadConfigFile(configPath);
}
