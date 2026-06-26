import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { isNativeApp } from '@/utils/platform';

const UPDATE_SERVER = 'https://1-nine-eta-34.vercel.app/update';
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

    // 告知 Capgo 当前 bundle 已正常加载
    await CapacitorUpdater.notifyAppReady();

    const packageVersion = (import.meta as any).env?.npm_package_version || '1.0.0';
    this.currentVersion = {
      version: packageVersion,
      buildNumber: 1,
    };
  }

  getCurrentVersion(): VersionInfo {
    return this.currentVersion || { version: '1.0.0', buildNumber: 1 };
  }

  async checkForUpdate(): Promise<UpdateResult> {
    try {
      const response = await fetch(`${UPDATE_SERVER}/${VERSION_FILE}?t=${Date.now()}`);
      if (!response.ok) throw new Error('获取版本信息失败');
      const latestVersion: VersionInfo = await response.json();

      const current = this.getCurrentVersion();
      const hasUpdate = latestVersion.buildNumber > current.buildNumber;
      const canHotUpdate = !!(latestVersion.zipUrl);

      return {
        hasUpdate,
        currentVersion: current.version,
        latestVersion: latestVersion.version,
        releaseNotes: latestVersion.releaseNotes,
        apkUrl: latestVersion.apkUrl,
        canHotUpdate,
      };
    } catch (error) {
      console.error('检查更新失败:', error);
      return {
        hasUpdate: false,
        currentVersion: this.getCurrentVersion().version,
        latestVersion: this.getCurrentVersion().version,
        canHotUpdate: false,
      };
    }
  }

  async downloadUpdate(onProgress?: (percent: number) => void): Promise<boolean> {
    if (!isNativeApp()) return false;

    try {
      const versionResponse = await fetch(`${UPDATE_SERVER}/${VERSION_FILE}?t=${Date.now()}`);
      if (!versionResponse.ok) throw new Error('获取版本信息失败');
      const latestVersion: VersionInfo = await versionResponse.json();

      if (!latestVersion.zipUrl) {
        throw new Error('没有可用的热更新包');
      }

      // Capgo 只支持整数版本号作为 bundle id
      const bundleId = latestVersion.buildNumber;

      if (onProgress) onProgress(0);

      const bundle = await CapacitorUpdater.download({
        version: String(bundleId),
        url: latestVersion.zipUrl,
      });

      if (onProgress) onProgress(100);

      // 下载成功后立即应用新 bundle
      await CapacitorUpdater.set({ id: bundle.id });

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
    const packageVersion = (import.meta as any).env?.npm_package_version || '1.0.0';
    this.currentVersion = { version: packageVersion, buildNumber: 1 };
  }
}

export const updateService = UpdateService.getInstance();
