import type { InferUITool, UIMessage } from "ai"
import z from "zod"
import { searchReplace } from "@repo/agent/tools/search-replace"
import { readFile } from "@repo/agent/tools/read-file"
import { list } from "@repo/agent/tools/ls"
import { globTool } from "@repo/agent/tools/glob"
import { grepTool } from "@repo/agent/tools/grep"
import { editFiles } from "@repo/agent/tools/edit-files"
import { deleteFile } from "@repo/agent/tools/delete-file"

export interface FileType {
    name: string
    type: "file" | "directory"
    isOpen?: boolean
    children?: FileType[]
    path: string
}

export interface FileEdit {
    relative_file_path: string
    code_edit: string
    instructions: string
    timestamp: Date
    toolName: string
}

export interface ToolCallFile {
    relative_file_path: string
    code_edit: string
    instructions: string
    old_string?: string
    new_string?: string
    replace_all?: boolean
}

export interface CodeMapping {
    currentFile: FileEdit | null
    editHistory: FileEdit[]
    fileList: Set<string>
}

export type DataPart = { type: 'append-message'; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;
type searchReplace = InferUITool<typeof searchReplace>;
type readFile = InferUITool<typeof readFile>;
type list = InferUITool<typeof list>;
type globTool = InferUITool<typeof globTool>;
type grepTool = InferUITool<typeof grepTool>;
type editFiles = InferUITool<typeof editFiles>;
type deleteFile = InferUITool<typeof deleteFile>;

export type ChatTools = {
  searchReplace: searchReplace;
  readFile: readFile;
  list: list;
  globTool: globTool;
  grepTool: grepTool;
  editFiles: editFiles;
  deleteFile: deleteFile;
};

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  appendMessage: string;
  id: string;
  title: string;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export interface Attachment {
  name: string;
  url: string;
  contentType: string;
}