/**
 * fsStore — 虚拟文件系统（内存态，刷新重置）
 * 树形结构：id → 节点映射 + parentId + children 列表
 */
import { create } from 'zustand';
import type { FsNode } from '../types/fs';
import { buildMockTree } from '../data/mockFiles';

interface FsState {
  nodes: Record<string, FsNode>;
  rootId: string;
  trashId: string;
  node: (id: string) => FsNode | undefined;
  children: (id: string) => FsNode[];
  ancestors: (id: string) => FsNode[];
  createFolder: (parentId: string, name?: string) => string;
  rename: (id: string, name: string) => void;
  trash: (id: string) => void;
  restore: (id: string) => void;
  emptyTrash: () => void;
  search: (query: string) => FsNode[];
}

const initial = buildMockTree();

export const useFsStore = create<FsState>()((set, get) => ({
  nodes: initial.nodes,
  rootId: initial.rootId,
  trashId: initial.trashId,

  node: (id) => get().nodes[id],

  children: (id) => {
    const n = get().nodes[id];
    if (!n?.children) return [];
    return n.children.map((cid) => get().nodes[cid]).filter(Boolean);
  },

  ancestors: (id) => {
    const list: FsNode[] = [];
    let cur = get().nodes[id];
    while (cur && cur.parentId) {
      const p = get().nodes[cur.parentId];
      if (!p) break;
      list.unshift(p);
      cur = p;
    }
    return list;
  },

  createFolder: (parentId, name = '未命名文件夹') => {
    const id = `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const node: FsNode = {
      id,
      name,
      type: 'folder',
      parentId,
      children: [],
      modified: Date.now(),
    };
    set((s) => ({
      nodes: {
        ...s.nodes,
        [id]: node,
        [parentId]: { ...s.nodes[parentId], children: [...(s.nodes[parentId]?.children ?? []), id] },
      },
    }));
    return id;
  },

  rename: (id, name) =>
    set((s) => {
      const n = s.nodes[id];
      if (!n || n.system) return s;
      return { nodes: { ...s.nodes, [id]: { ...n, name, modified: Date.now() } } };
    }),

  trash: (id) =>
    set((s) => {
      const n = s.nodes[id];
      if (!n || n.system || !n.parentId) return s;
      const parent = s.nodes[n.parentId];
      // 从原父节点移除
      const nodes = { ...s.nodes };
      if (parent?.children) {
        nodes[parent.id] = { ...parent, children: parent.children.filter((c) => c !== id) };
      }
      // 移入废纸篓
      const trash = nodes[s.trashId];
      nodes[s.trashId] = { ...trash, children: [...(trash.children ?? []), id] };
      nodes[id] = { ...n, parentId: s.trashId, modified: Date.now() };
      return { nodes };
    }),

  restore: (id) =>
    set((s) => {
      const n = s.nodes[id];
      if (!n || n.parentId !== s.trashId) return s;
      const nodes = { ...s.nodes };
      const trash = nodes[s.trashId];
      nodes[s.trashId] = { ...trash, children: (trash.children ?? []).filter((c) => c !== id) };
      nodes[id] = { ...n, parentId: s.rootId };
      const root = nodes[s.rootId];
      nodes[s.rootId] = { ...root, children: [...(root.children ?? []), id] };
      return { nodes };
    }),

  emptyTrash: () =>
    set((s) => {
      const nodes = { ...s.nodes };
      const trash = nodes[s.trashId];
      for (const c of trash.children ?? []) delete nodes[c];
      nodes[s.trashId] = { ...trash, children: [] };
      return { nodes };
    }),

  search: (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return Object.values(get().nodes).filter(
      (n) => n.id !== get().rootId && n.name.toLowerCase().includes(q),
    );
  },
}));
