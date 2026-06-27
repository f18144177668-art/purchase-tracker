import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const versionFile = path.join(__dirname, '..', 'public', 'version.json');

const version = JSON.parse(fs.readFileSync(versionFile, 'utf-8'));
version.buildNumber = (version.buildNumber || 1) + 1;
fs.writeFileSync(versionFile, JSON.stringify(version, null, 2));

console.log(`版本号已递增: ${version.version} (build ${version.buildNumber})`);
