/**
 * AssetManager - Clou  constructor(config: AssetConfig) {
    if (!config.r2.baseUrl) {
      throw new Error('VITE_R2_BASE_URL environment variable is required but not set');
    }
    
    this.config = config;
    // Debug log to show Cloudflare R2 bucket
    console.log(`☁️ AssetManager: Using Cloudflare R2 at ${this.config.r2.baseUrl}`);
    if (this.config.r2.bucketName) {
      console.log(`📦 R2 Bucket: ${this.config.r2.bucketName}`);
    }
  }2 Asset Management System
 * 
 * Supports: JSON, Images (PNG, JPG, SVG), PDFs, and other file types
 * All assets are served from Cloudflare R2 bucket
 */

export interface AssetConfig {
  // Cloudflare R2 bucket configuration
  r2: {
    baseUrl: string;
    bucketName?: string; // Optional for logging/debugging
  };
}

export type AssetType = 'json' | 'image' | 'texture' | 'document' | 'asset';

export interface AssetRequest {
  name: string;
  type: AssetType;
  folder?: string; // Optional custom folder override
}

class AssetManager {
  private config: AssetConfig;
  private cache: Map<string, any> = new Map();

  constructor(config: AssetConfig) {
    this.config = config;
    // Debug log to show Cloudflare R2 bucket
    console.log(`☁️ AssetManager: Using Cloudflare R2 at ${this.config.r2.baseUrl}`);
    if (this.config.r2.bucketName) {
      console.log(`� R2 Bucket: ${this.config.r2.bucketName}`);
    }
  }

  /**
   * Get the full URL for an asset with a direct path from JSON
   * This method treats the name as a complete path relative to R2 baseUrl
   */
  private getDirectAssetUrl(path: string): string {
    return `${this.config.r2.baseUrl}/${path}`;
  }

  /**
   * Get the full URL for an asset from Cloudflare R2
   */
  private getAssetUrl(request: AssetRequest): string {
    const { name, type, folder } = request;
    
    const baseUrl = this.config.r2.baseUrl;
    let folderPath: string;

    if (folder) {
      folderPath = folder;
    } else {
      // Map asset types to their R2 folder structure
      switch (type) {
        case 'texture':
          folderPath = 'textures';
          break;
        case 'image':
        case 'asset':
          folderPath = 'assets';
          break;
        case 'json':
          folderPath = 'data';
          break;
        case 'document':
          folderPath = 'documents';
          break;
        default:
          folderPath = 'assets';
      }
    }

    return `${baseUrl}/${folderPath}/${name}`;
  }

  /**
   * Generate cache key for an asset
   */
  private getCacheKey(request: AssetRequest): string {
    return `${request.type}_${request.folder || 'default'}_${request.name}`;
  }

  /**
   * Fetch JSON data
   */
  async fetchJson<T = any>(name: string, folder?: string): Promise<T> {
    const request: AssetRequest = { name, type: 'json', folder };
    const cacheKey = this.getCacheKey(request);

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const url = this.getAssetUrl(request);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch JSON: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error fetching JSON asset "${name}":`, error);
      throw error;
    }
  }

  /**
   * Fetch image as URL (for img src attributes)
   */
  async fetchImageUrl(name: string, folder?: string): Promise<string> {
    const request: AssetRequest = { name, type: 'image', folder };
    const cacheKey = this.getCacheKey(request);

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const url = this.getAssetUrl(request);
    
    // Verify the image exists
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Image not found: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error fetching image "${name}":`, error);
      throw error;
    }

    this.cache.set(cacheKey, url);
    return url;
  }

  /**
   * Fetch texture (for Three.js TextureLoader)
   */
  async fetchTextureUrl(name: string): Promise<string> {
    return this.getAssetUrl({ name, type: 'texture' });
  }

  /**
   * Fetch multiple textures from JSON paths at once
   */
  async fetchTextureUrlsFromPaths(paths: string[]): Promise<string[]> {
    return paths.map(path => this.getDirectAssetUrl(path));
  }

  /**
   * Fetch multiple textures at once - legacy method
   */
  async fetchTextureUrls(names: string[]): Promise<string[]> {
    return names.map(name => this.getAssetUrl({ name, type: 'texture' }));
  }

  /**
   * Fetch image URL from JSON path
   */
  async fetchImageUrlFromPath(path: string): Promise<string> {
    return this.getDirectAssetUrl(path);
  }

  /**
   * Fetch document URL from JSON path
   */
  async fetchDocumentUrlFromPath(path: string): Promise<string> {
    return this.getDirectAssetUrl(path);
  }

  /**
   * Fetch document (PDF, DOC, etc.) - legacy method
   */
  async fetchDocumentUrl(name: string, folder?: string): Promise<string> {
    const request: AssetRequest = { name, type: 'document', folder };
    return this.getAssetUrl(request);
  }

  /**
   * Generic asset fetcher - returns the URL
   */
  async fetchAssetUrl(name: string, type: AssetType, folder?: string): Promise<string> {
    const request: AssetRequest = { name, type, folder };
    return this.getAssetUrl(request);
  }

  /**
   * Preload assets for better performance
   */
  async preloadAssets(assets: AssetRequest[]): Promise<void> {
    const promises = assets.map(async (asset) => {
      try {
        switch (asset.type) {
          case 'json':
            await this.fetchJson(asset.name, asset.folder);
            break;
          case 'image':
          case 'asset':
            await this.fetchImageUrl(asset.name, asset.folder);
            break;
          case 'texture':
            // For textures, just get the URL (Three.js will handle loading)
            this.fetchTextureUrl(asset.name);
            break;
          case 'document':
            this.fetchDocumentUrl(asset.name, asset.folder);
            break;
        }
      } catch (error) {
        console.warn(`Failed to preload asset: ${asset.name}`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

}

// Configuration for Cloudflare R2 bucket
const defaultConfig: AssetConfig = {
  r2: {
    baseUrl: import.meta.env.VITE_R2_BASE_URL!,
    bucketName: 'myverypublicstorage'
  }
};

// Singleton instance
export const assetManager = new AssetManager(defaultConfig);

// Export the class for custom instances
export default AssetManager;
