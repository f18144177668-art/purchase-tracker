import appVersion from '../../public/version.json';

const UPDATE_SERVER = 'https://f18144177668-art.github.io/purchase-tracker/update';
const VERSION_FILE = 'version.json';

export interface VersionInfo {
  version: string;
  updateUrl?: string;
  apkUrl?: string;
  releaseNotes?: string;
}

export interface UpdateResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseNotes?: string;
  apkUrl?: string;
}

class UpdateService {
  private static instance: UpdateService;

  static getInstance(): UpdateService {
    if (!UpdateService.instance) {
      UpdateService.instance = new UpdateService();
    }
    return UpdateService.instance;
  }

  getCurrentVersion(): VersionInfo {
    return {
      version: appVersion.version,
      updateUrl: appVersion.updateUrl,
      apkUrl: appVersion.apkUrl,
      releaseNotes: appVersion.releaseNotes,
    };
  }

  async checkForUpdate(): Promise<UpdateResult> {
    try {
      const url = `${UPDATE_SERVER}/${VERSION_FILE}?t=${Date.now()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('无法获取版本信息');
      const latest: VersionInfo = await response.json();

      const current = this.getCurrentVersion();
      const hasUpdate = this.compareVersion(latest.version, current.version) > 0;

      return {
        hasUpdate,
        currentVersion: current.version,
        latestVersion: latest.version,
        releaseNotes: latest.releaseNotes,
        apkUrl: latest.apkUrl,
      };
    } catch (error) {
      console.error('检查更新失败:', error);
      const current = this.getCurrentVersion();
      return {
        hasUpdate: false,
        currentVersion: current.version,
        latestVersion: current.version,
      };
    }
  }

  private compareVersion(a: string, b: string): number {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const diff = (partsA[i] || 0) - (partsB[i] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  }
}

export const updateService = UpdateService.getInstance();
