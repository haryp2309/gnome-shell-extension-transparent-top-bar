export class SettingsManager {
  static KEYS = {
    OPACITY_DARK: "transparency-dark",
    OPACITY_LIGHT: "transparency-light",
    DISABLE_ON_FULLSCREEN: "dark-full-screen",
  };

  constructor(settings) {
    this._settings = settings;
    this.previousTransparencyDark = null;
    this.previousTransparencyLight = null;
  }

  /**
   * @returns {number}
   */
  getTransparencyDark() {
    this.previousTransparencyDark = this._settings.get_int(
      SettingsManager.KEYS.OPACITY_DARK
    );
    return this.previousTransparencyDark;
  }

  /**
   * @returns {number}
   */
  getTransparencyLight() {
    this.previousTransparencyLight = this._settings.get_int(
      SettingsManager.KEYS.OPACITY_LIGHT
    );
    return this.previousTransparencyLight;
  }

  /**
   * @returns {boolean}
   */
  getDisableOnFullscreen() {
    return this._settings.get_boolean(
      SettingsManager.KEYS.DISABLE_ON_FULLSCREEN
    );
  }

  /**
   * @param {(key: string) =>void} callback
   */
  onChange(callback) {
    this._settings.connect("changed", (_, key) => callback(key));
  }
}
