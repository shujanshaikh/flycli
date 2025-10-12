import {z } from "zod"
import path from "node:path"
import {  writeFile  , access, readFile} from "node:fs/promises";
import type { Config, ConfigFile } from "./types";

// Zod schema for plugin 

const pluginSchema = z.union([
    z.string(),
    z
      .object({
        name: z.string(),
        path: z.string().optional(),
        url: z.string().optional(),
      })
      .refine((data: { path?: string; url?: string }) => (data.path && !data.url) || (!data.path && data.url), {
        message: 'Plugin must have either path or url, but not both',
      }),
  ]);
  
  // Zod schema for the config file
const configFileSchema = z.object({
    port: z
      .number()
      .int()
      .min(1)
      .max(65535)
      .optional()
      .describe('Port number for Jafdotdev server'),
    appPort: z
      .number()
      .int()
      .min(1)
      .max(65535)
      .optional()
      .describe('Port number for your development app'),
    autoPlugins: z.boolean().optional(),
    plugins: z.array(pluginSchema).optional(),
  });
  

export const CONFIG_FILE_NAME = "jafdotdev.json";



export const loadConfigFile = async ({
    dir 
} : {
    dir : string
}) : Promise<ConfigFile  | null>  => {
    const configFile = path.join(dir , CONFIG_FILE_NAME)

   try {
    const fileContent = await readFile(configFile , "utf-8")
    let parsedContent : ConfigFile ;

 try {
    parsedContent = JSON.parse(fileContent);
  } catch (jsonError) {
    const error = {
      type: 'json',
      message: `Failed to parse ${CONFIG_FILE_NAME}`,
      details:
        jsonError instanceof Error
          ? jsonError.message
          : 'Invalid JSON syntax',
    };
    throw error;
  }

  // Extract eddyMode before validation (keep it undocumented)
  const eddyMode = parsedContent.eddyMode;

   try {
    const validatedConfig = configFileSchema.parse(parsedContent);
      // Add eddyMode back if it exists
      let result : ConfigFile = validatedConfig;
      if (eddyMode !== undefined) {
        // It need to be result.eddyMode it might throw the error or cause issue
        result.eddyMode = eddyMode;
      }
      return result;
   } catch (error) {
    console.log(error)
   }
   } catch (error) {
     console.log(error)
   }
   return null;
}


export const saveConfigFile = async (
    dir: string,
    config: Config,
  ): Promise<void> => {
    const configPath = path.join(dir, CONFIG_FILE_NAME);
  
    // Validate before saving
    const validatedConfig = configFileSchema.parse(config);
  
    // Pretty print the JSON
    const content = JSON.stringify(validatedConfig, null, 2);
  
    await writeFile(configPath, content, 'utf-8');
  };
  
  export const configFileExists = async (dir: string): Promise<boolean> => {
    const configPath = path.join(dir, CONFIG_FILE_NAME);
  
    try {
      await access(configPath);
      return true;
    } catch {
      return false;
    }
  };
  