import * as Main from "resource:///org/gnome/shell/ui/main.js";

export class StylingClassManager {
  static KEYS = {
    BASE_CLASS: "baseClass",
    COLOR_SPECIFIC: "colorSpecific",
    OPACITY_SPECIFIC: "opacitySpecific",
  };
  constructor() {
    this._enabledMainPanelClasses = {};
  }

  /**
   * @param {string} key
   * @param {string} className
   */
  _addMainPanelClass(key, className) {
    this._removeMainPanelClass(key);
    this._enabledMainPanelClasses[key] = className;
    Main.panel.add_style_class_name(className);
  }

  /**
   * @param {string} key
   */
  _removeMainPanelClass(key) {
    const className = this._enabledMainPanelClasses[key];
    if (className) {
      Main.panel.remove_style_class_name(className);
    }
    delete this._enabledMainPanelClasses[key];
  }

  enableBaseClass() {
    this._addMainPanelClass(
      StylingClassManager.KEYS.BASE_CLASS,
      "transparent-top-bar"
    );
  }

  disableBaseClass() {
    this._removeMainPanelClass(StylingClassManager.KEYS.BASE_CLASS);
  }

  /**
   * @param {string} colorScheme
   */
  enableColorSpecificClass(colorScheme) {
    this._addMainPanelClass(
      StylingClassManager.KEYS.COLOR_SPECIFIC,
      "transparent-top-bar-" + colorScheme
    );
  }

  disableColorSpecificClass() {
    this._removeMainPanelClass(StylingClassManager.KEYS.COLOR_SPECIFIC);
  }

  /**
   * @param {string} colorScheme
   * @param {number} transparency
   */
  enableOpacitySpecificClass(colorScheme, transparency) {
    this._addMainPanelClass(
      StylingClassManager.KEYS.OPACITY_SPECIFIC,
      "transparent-top-bar-" + colorScheme + "-" + transparency
    );
  }

  disableOpacitySpecificClass() {
    this._removeMainPanelClass(StylingClassManager.KEYS.OPACITY_SPECIFIC);
  }

  disableAll() {
    for (const key of Object.keys(this._enabledMainPanelClasses)) {
      this._removeMainPanelClass(key);
    }
  }
}
