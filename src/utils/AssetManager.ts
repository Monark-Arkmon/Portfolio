/**
 * AssetManager - A robust asset fetching system
 * 
 * Supports: JSON, Images (PNG, JPG, SVG), PDFs, and other file types
 * Currently uses local assets, easily convertible to Cloudflare R2
 */

export interface AssetConfig {
  // Local development configuration
  local: {
    baseUrl: string;
    folders: {
      textures: string;
      images: string;
      assets: string;
      data: string;
      documents: string;
    };
  };
  // Future Cloudflare R2 configuration (commented for now)
  // cloudflare: {
  //   baseUrl: string;
  //   bucketName: string;
  //   accountId: string;
  //   accessKeyId?: string;
  //   secretAccessKey?: string;
  // };
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
  private isProduction: boolean;

  constructor(config: AssetConfig) {
    this.config = config;
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Get the full URL for an asset
   */
  private getAssetUrl(request: AssetRequest): string {
    const { name, type, folder } = request;
    
    // For now, use local assets only
    const baseUrl = this.config.local.baseUrl;
    let folderPath: string;

    if (folder) {
      folderPath = folder;
    } else {
      switch (type) {
        case 'texture':
          folderPath = this.config.local.folders.textures;
          break;
        case 'image':
        case 'asset':
          folderPath = this.config.local.folders.assets;
          break;
        case 'json':
          folderPath = this.config.local.folders.data;
          break;
        case 'document':
          folderPath = this.config.local.folders.documents;
          break;
        default:
          folderPath = this.config.local.folders.assets;
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
   * Fetch multiple textures at once
   */
  async fetchTextureUrls(names: string[]): Promise<string[]> {
    return names.map(name => this.getAssetUrl({ name, type: 'texture' }));
  }

  /**
   * Fetch document (PDF, DOC, etc.)
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

  // Future Cloudflare R2 methods (commented for now)
  /*
  private async fetchFromCloudflare(request: AssetRequest): Promise<string> {
    // Implementation for Cloudflare R2 fetching
    // Will be uncommented and implemented when moving to production
  }

  private getCloudflareUrl(request: AssetRequest): string {
    // Implementation for Cloudflare URL generation
    // Will be uncommented and implemented when moving to production
  }
  */
}

// Default configuration
const defaultConfig: AssetConfig = {
  local: {
    baseUrl: '/src',
    folders: {
      textures: 'textures',
      images: 'assets',
      assets: 'assets',
      data: 'data',
      documents: 'documents'
    }
  }
};

// Singleton instance
export const assetManager = new AssetManager(defaultConfig);

// Export the class for custom instances
export default AssetManager;
