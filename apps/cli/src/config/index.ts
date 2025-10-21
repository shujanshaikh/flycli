import type { Config } from "./types.js";
import { getConfigFromFile } from "./config-file.js";
import {
  port,
  appPort,
  workspace,
  silent,
  verbose,
  bridgeMode,
} from "./parser.js";

export class ConfigResolver {
    private config : Config | null = null
    
    async resolveConfig(): Promise<Config> {
        if (this.config) {
            return this.config;
        }

        const workspaceDir = workspace || process.cwd();
        const fileConfig = getConfigFromFile(workspaceDir);

        this.config = {
            port: port ?? fileConfig.port ?? 3100,
            appPort: appPort ?? fileConfig.appPort ?? 3000,
            dir: workspaceDir,
            silent: silent ?? false,
            verbose: verbose ?? false,
            token: undefined,
            bridgeMode: bridgeMode ?? false,
            autoPlugins: fileConfig.autoPlugins ?? false,
            plugins: fileConfig.plugins ?? [],
            eddyMode: fileConfig.eddyMode,
        };

        return this.config;
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