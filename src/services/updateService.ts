import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { isNativeApp } from '@/utils/platform';
import appVersion from '../../public/version.json';

const UPDATE_SERVER = 'https://f18144177668-art.github.io/purchase-tracker/update';
const VERSION_FILE = 'version.json';

export interface VersionInfo {
  version: string;
  buildNumber: number;
  updateUrl?: string;
  apkUrl?: string;
  releaseNotes?: string;
  manifest?: string[];
  zipUrl?: string;
}

export interface UpdateResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  currentBuild: number;
  latestBuild: number;
  releaseNotes?: string;
  apkUrl?: string;
  canHotUpdate: boolean;
}

export class UpdateService {
  private static instance: UpdateService;
  private currentVersion: VersionInfo | null = null;

  static getInstance(): UpdateService {
    if (!UpdateService.instance) {
      UpdateService.instance = new UpdateService();
    }
    return UpdateService.instance;
  }

  async init(): Promise<void> {
    if (!isNativeApp()) return;

    // 向 Capgo 通知当前 bundle 已就绪
    await CapacitorUpdater.notifyAppReady();

    this.currentVersion = {
      version: appVersion.version,
      buildNumber: appVersion.buildNumber,
    };
  }

  getCurrentVersion(): VersionInfo {
    return this.currentVersion || {
      version: appVersion.version,
      buildNumber: appVersion.buildNumber,
    };
  }

  async checkForUpdate(): Promise<UpdateResult> {
    try {
      const url = `${UPDATE_SERVER}/${VERSION_FILE}?t=${Date.now()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('无法获取版本信息');
      const latestVersion: VersionInfo = await response.json();

      const current = this.getCurrentVersion();
      const hasUpdate = latestVersion.buildNumber > current.buildNumber;
      const canHotUpdate = !!(latestVersion.zipUrl);

      return {
        hasUpdate,
        currentVersion: current.version,
        latestVersion: latestVersion.version,
        currentBuild: current.buildNumber,
        latestBuild: latestVersion.buildNumber,
        releaseNotes: latestVersion.releaseNotes,
        apkUrl: latestVersion.apkUrl,
        canHotUpdate,
      };
    } catch (error) {
      console.error('检查更新失败:', error);
      const current = this.getCurrentVersion();
      return {
        hasUpdate: false,
        currentVersion: current.version,
        latestVersion: current.version,
        currentBuild: current.buildNumber,
        latestBuild: current.buildNumber,
        canHotUpdate: false,
      };
    }
  }

  async downloadUpdate(onProgress?: (percent: number) => void): Promise<boolean> {
    if (!isNativeApp()) return false;

    try {
      const url = `${UPDATE_SERVER}/${VERSION_FILE}?t=${Date.now()}`;
      const versionResponse = await fetch(url);
      if (!versionResponse.ok) throw new Error('无法获取版本信息');
      const latestVersion: VersionInfo = await versionResponse.json();

      if (!latestVersion.zipUrl) {
        throw new Error('未找到更新包下载地址');
      }

      // 用 buildNumber 作为 Capgo 的 bundle id
      const bundleId = latestVersion.buildNumber;

      if (onProgress) onProgress(0);

      const bundle = await CapacitorUpdater.download({
        version: String(bundleId),
        url: latestVersion.zipUrl,
      });

      if (onProgress) onProgress(100);

      // 设置为当前 bundle，然后立即重启加载新 bundle
      await CapacitorUpdater.set({ id: bundle.id });

      setTimeout(() => {
        CapacitorUpdater.reload();
      }, 500);

      this.currentVersion = latestVersion;
      return true;
    } catch (error) {
      console.error('下载更新失败:', error);
      return false;
    }
  }

  async resetToDefault(): Promise<void> {
    if (!isNativeApp()) return;
    await CapacitorUpdater.reset();
    this.currentVersion = {
      version: appVersion.version,
      buildNumber: appVersion.buildNumber,
    };
  }
}

export const updateService = UpdateService.getInstance();
