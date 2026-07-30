package org.ssssy.backend.event;

/**
 * Fired when a plugin is installed and activated for the first time.
 * Plugins and internal services can listen to this to react to new capabilities.
 */
public class PluginInstalledEvent extends CmsEvent {

  private final String pluginId;
  private final String pluginName;
  private final String version;

  public PluginInstalledEvent(String pluginId, String pluginName, String version) {
    super(null); // system-initiated, no actor
    this.pluginId   = pluginId;
    this.pluginName = pluginName;
    this.version    = version;
  }

  @Override
  public String getEventType() { return "PLUGIN_INSTALLED"; }

  public String getPluginId()   { return pluginId;   }
  public String getPluginName() { return pluginName; }
  public String getVersion()    { return version;    }
}
