import type { Config } from "./types";

export class ConfigResolver {
    private config : Config | null = null
    
    // Extra handling if in case the config is not loaded need to add extra error handling while doingh this 
    async resolveConfig() {

    }


    getConfig(): Config {
        if (!this.config) {
          throw new Error('Config not resolved yet. Call resolveConfig() first.');
        }
        return this.config;
      }
}

export const configResolver = new ConfigResolver();
export default configResolver;