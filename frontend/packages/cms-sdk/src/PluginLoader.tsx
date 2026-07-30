/**
 * @ssssy/cms-sdk — PluginLoader
 *
 * Reads active plugin manifests from the backend and dynamically imports
 * any JS bundles the plugins declare. Each bundle calls CmsSDK.register*()
 * on load, wiring its blocks/routes/renderers into the live registry.
 *
 * Usage (in admin layout.tsx):
 *   <PluginLoader />
 *
 * The component is invisible — it only loads scripts as a side-effect.
 * Uses the global NEXT_PUBLIC_API_URL env var and the admin auth token from localStorage.
 */

"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { PluginManifest } from "./types";

interface InstalledPlugin {
  id: string;
  pluginId: string;
  pluginName: string;
  status: string;
  manifestJson?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/** No props required — uses NEXT_PUBLIC_API_URL and localStorage token automatically. */
export function PluginLoader() {
  const loadedBundles = useRef(new Set<string>());

  // Fetch all active plugins from the backend
  const { data: plugins = [] } = useQuery({
    queryKey: ["sdk-plugin-loader"],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.get<ApiResponse<InstalledPlugin[]>>(
        `${baseUrl}/admin/plugins/active`,
        { headers }
      );
      return data.data;
    },
    staleTime: 120_000,
    retry: false,
  });

  useEffect(() => {
    for (const plugin of plugins) {
      if (!plugin.manifestJson) continue;
      let manifest: PluginManifest | null = null;
      try {
        manifest = JSON.parse(plugin.manifestJson) as PluginManifest;
      } catch { continue; }

      const bundleUrl = manifest.frontendBundleUrl;
      if (!bundleUrl || loadedBundles.current.has(bundleUrl)) continue;

      // Dynamically load the JS bundle — it will call CmsSDK.registerBlock() etc. on load
      const script = document.createElement("script");
      script.src = bundleUrl;
      script.async = true;
      script.dataset.pluginId = plugin.pluginId;
      script.onload = () => {
        loadedBundles.current.add(bundleUrl);
        console.log(`[CmsSDK] Loaded frontend bundle for plugin: ${plugin.pluginName}`);
      };
      script.onerror = () => {
        console.warn(`[CmsSDK] Failed to load bundle for plugin: ${plugin.pluginName} (${bundleUrl})`);
      };
      document.head.appendChild(script);
      loadedBundles.current.add(bundleUrl); // mark immediately to prevent double-load
    }
  }, [plugins]);

  // This component renders nothing — it only has side-effects
  return null;
}
