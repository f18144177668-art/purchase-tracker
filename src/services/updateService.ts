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

    // ?? Capgo ?? bundle ?????
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
      const response = await fetch(`${UPDATE_SERVER}/${VERSION_FILE}?t=${Date.now()}`);
      if (!response.ok) throw new Error('????????');
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
      console.error('??????:', error);
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
      if (!versionResponse.ok) throw new Error('????????');
      const latestVersion: VersionInfo = await versionResponse.json();

      if (!latestVersion.zipUrl) {
        throw new Error('?????????');
      }

      // Capgo ?????????? bundle id
      const bundleId = latestVersion.buildNumber;

      if (onProgress) onProgress(0);

      const bundle = await CapacitorUpdater.download({
        version: String(bundleId),
        url: latestVersion.zipUrl,
      });

      if (onProgress) onProgress(100);

      // ?????????? bundle
      await CapacitorUpdater.set({ id: bundle.id });

      this.currentVersion = latestVersion;
      return true;
    } catch (error) {
      console.error('??????:', error);
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
