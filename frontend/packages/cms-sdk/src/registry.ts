/**
 * @ssssy/cms-sdk — CmsSDK Plugin Registry
 *
 * The global singleton registry that frontend plugins call to register:
 *   - Page-builder blocks  (CmsSDK.registerBlock)
 *   - Admin sidebar routes (CmsSDK.registerAdminRoute)
 *   - Content renderers    (CmsSDK.registerContentRenderer)
 *
 * The page-builder and plugin admin UI read from this registry at runtime —
 * no webpack rebuild needed to pick up a new plugin.
 *
 * Usage (inside a plugin bundle):
 *   import { CmsSDK } from '@ssssy/cms-sdk';
 *   CmsSDK.registerBlock({ type: 'research-citation', label: 'Research Citation', render: CitationBlock });
 */

import type {
  PluginBlockDefinition,
  PluginAdminRoute,
  PluginContentRenderer,
} from "./types";

// ─── Internal registry maps ───────────────────────────────────────────────────

const _blocks = new Map<string, PluginBlockDefinition>();
const _routes = new Map<string, PluginAdminRoute>();
const _renderers = new Map<string, PluginContentRenderer>();
const _listeners: Array<() => void> = [];

function _notify() {
  _listeners.forEach((fn) => fn());
}

// ─── CmsSDK public API ────────────────────────────────────────────────────────

export const CmsSDK = {
  /**
   * Register a custom page-builder block.
   * Blocks appear in the page-builder block palette and can be dropped onto any page.
   */
  registerBlock(definition: PluginBlockDefinition): void {
    _blocks.set(definition.type, definition);
    _notify();
  },

  /**
   * Register a custom admin sidebar route.
   * Routes appear under /admin/{path} and in the sidebar navigation.
   */
  registerAdminRoute(route: PluginAdminRoute): void {
    _routes.set(route.path, route);
    _notify();
  },

  /**
   * Register a content type renderer.
   * When the public site renders a dynamic content type entry, the matching
   * renderer is used instead of the default field-list renderer.
   */
  registerContentRenderer(renderer: PluginContentRenderer): void {
    _renderers.set(renderer.contentType, renderer);
    _notify();
  },

  // ─── Read-only accessors ─────────────────────────────────────────────────

  getBlock(type: string): PluginBlockDefinition | undefined {
    return _blocks.get(type);
  },

  getAllBlocks(): PluginBlockDefinition[] {
    return Array.from(_blocks.values());
  },

  getAdminRoute(path: string): PluginAdminRoute | undefined {
    return _routes.get(path);
  },

  getAllAdminRoutes(): PluginAdminRoute[] {
    return Array.from(_routes.values());
  },

  getContentRenderer(contentType: string): PluginContentRenderer | undefined {
    return _renderers.get(contentType);
  },

  getAllContentRenderers(): PluginContentRenderer[] {
    return Array.from(_renderers.values());
  },

  /**
   * Subscribe to registry changes (block/route/renderer added or removed).
   * Returns an unsubscribe function.
   */
  subscribe(listener: () => void): () => void {
    _listeners.push(listener);
    return () => {
      const idx = _listeners.indexOf(listener);
      if (idx !== -1) _listeners.splice(idx, 1);
    };
  },

  /** Clear all registrations — used in tests only. */
  _reset(): void {
    _blocks.clear();
    _routes.clear();
    _renderers.clear();
  },
} as const;
