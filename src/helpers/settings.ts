const SETTINGS_KEY = "plugin-settings";

export interface CustomStatus {
  text: string;
  color: RGB;
}

export interface PluginSettings {
  shouldGroupBadgeAndElement: boolean;
  customStatuses: Array<CustomStatus>;
}

export const loadSettings = async (): Promise<PluginSettings> => {
  const defaults: PluginSettings = {
    shouldGroupBadgeAndElement: false,
    customStatuses: [
      {
        text: "Custom",
        color: {
          r: 0.5,
          g: 0.5,
          b: 0.5
        }
      }
    ]
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
