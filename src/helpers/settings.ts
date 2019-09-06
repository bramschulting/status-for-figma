const SETTINGS_KEY = "plugin-settings";

export interface PluginSettings {
  shouldGroupBadgeAndElement: boolean;
}

export const loadSettings = async (): Promise<PluginSettings> => {
  const defaults: PluginSettings = {
    shouldGroupBadgeAndElement: false
  };

  try {
    const storedSettings = await figma.clientStorage.getAsync(SETTINGS_KEY);

    return {
      ...defaults,
      ...storedSettings
    };
  } catch {
    return defaults;
  }
};

export const updateSettings = (nextSettings: PluginSettings): Promise<void> => {
  return figma.clientStorage.setAsync(SETTINGS_KEY, nextSettings);
};
