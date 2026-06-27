import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const updateDir = path.join(distDir, 'update');
const versionFile = path.join(rootDir, 'public', 'version.json');

function getAllFiles(dir, baseDir = '') {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = baseDir ? `${baseDir}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, relativePath));
    } else {
      files.push(relativePath);
    }
  }

  return files;
}

function buildUpdateBundle() {
  console.log('开始构建更新包...');

  if (!fs.existsSync(distDir)) {
    console.error('dist目录不存在，请先执行 npm run build');
    process.exit(1);
  }

  if (fs.existsSync(updateDir)) {
    fs.rmSync(updateDir, { recursive: true, force: true });
  }
  fs.mkdirSync(updateDir, { recursive: true });

  // 读取并自动递增 buildNumber
  const version = JSON.parse(fs.readFileSync(versionFile, 'utf-8'));
  version.buildNumber = (version.buildNumber || 1) + 1;
  fs.writeFileSync(versionFile, JSON.stringify(version, null, 2));
  console.log(`版本号已递增: ${version.version} (build ${version.buildNumber})`);

  const assetsDir = path.join(distDir, 'assets');
  const assetFiles = fs.existsSync(assetsDir) ? getAllFiles(assetsDir, 'assets') : [];

  const rootFiles = fs.readdirSync(distDir)
    .filter(f => {
      const stat = fs.statSync(path.join(distDir, f));
      return stat.isFile() && f !== 'update-data.html';
    });

  const manifest = [...rootFiles, ...assetFiles];

  console.log(`找到 ${manifest.length} 个文件需要复制`);

  for (const file of manifest) {
    const srcPath = path.join(distDir, file);
    const destPath = path.join(updateDir, file);

    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(srcPath, destPath);
  }

  // 生成 Capgo 热更新可用的 zip 包
  const zip = new AdmZip();
  for (const file of manifest) {
    zip.addLocalFile(path.join(distDir, file), path.dirname(file));
  }
  const zipPath = path.join(updateDir, 'bundle.zip');
  zip.writeZip(zipPath);

  const updateVersion = {
    ...version,
    manifest,
    zipUrl: `${version.updateUrl || ''}bundle.zip`,
  };

  fs.writeFileSync(
    path.join(updateDir, 'version.json'),
    JSON.stringify(updateVersion, null, 2)
  );

  console.log('更新包构建完成！');
  console.log(`版本: ${version.version} (${version.buildNumber})`);
  console.log(`更新包位置: ${updateDir}`);
  console.log(`文件数量: ${manifest.length}`);
  console.log(`ZIP 包: ${zipPath}`);
}

buildUpdateBundle();
