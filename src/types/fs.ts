/** 虚拟文件系统类型（仅内存态） */

export type FsNodeType = 'folder' | 'file' | 'app';

export interface FsNode {
  id: string;
  name: string;
  type: FsNodeType;
  parentId: string | null; // null => 根
  /** folder: 子节点 id 列表 */
  children?: string[];
  /** file/app: 字节数 */
  size?: number;
  /** 'text' | 'image' | 'app' | 'log' | 'other' */
  kind?: string;
  /** 文本内容（Quick Look 预览用） */
  content?: string;
  /** 修改时间戳 */
  modified: number;
  /** 系统节点不可删除/重命名 */
  system?: boolean;
}
