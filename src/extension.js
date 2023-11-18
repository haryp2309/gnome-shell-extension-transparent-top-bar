import Meta from 'gi://Meta';
import St from 'gi://St';
import GLib from 'gi://GLib';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {SettingsManager} from './managers/settingsManager.js';
import {StylingClassManager} from './managers/stylingClassManager.js';
import {ShellEventManager} from './managers/shellEventManager.js';

const config = {
    extensionId: 'com.ftpix.transparentbar',
    colorSchemes: ['light', 'dark'],
};

export default class TransparentTopBarWithCustomTransparencyExtension extends Extension {
    constructor(metadata) {
        super(metadata);
    }

    enable() {
        this._stylingClassManager = new StylingClassManager();
        const settings = this.getSettings(config.extensionId);
        this._settingsManager = new SettingsManager(settings);
        this._shellEventManager = new ShellEventManager();
        this._setupListeners();
        this._updateTransparent();
        this._stylingClassManager.enableBaseClass();
    }

    disable() {
        if (this._delayedTimeoutId != null) {
            GLib.Source.remove(this._delayedTimeoutId);
        }
        this._delayedTimeoutId = null;
        this._stylingClassManager.disableAll();
        this._shellEventManager.disconnect();
        this._settingsManager = null;
    }

    _setupListeners() {
        this._settingsManager.onChange(
            this._updateTransparentDelayed.bind(this)
        );

        this._shellEventManager.onWindowPositionChange(
            this._updateTransparent.bind(this)
        );

        //Use a delayed version of _updateTransparent to let the shell catch up
        this._shellEventManager.onWorkspaceSwitch(
            this._updateTransparentDelayed.bind(this)
        );

        this._shellEventManager.onColorSchemeChange(
            this._updateTransparent.bind(this)
        );

        this._shellEventManager.onWindowDestroy(
            this._updateTransparentDelayed.bind(this)
        );
    }

    _isAnyWindowNearTopBar() {
        if (!Main.sessionMode.hasWindows) return false;

        // Get all the windows in the active workspace that are in the primary monitor and visible.
        const windows = global.workspace_manager
            .get_active_workspace()
            .list_windows()
            .filter(metaWindow => {
                return (
                    metaWindow.is_on_primary_monitor() &&
                    metaWindow.showing_on_its_workspace() &&
                    !metaWindow.is_hidden() &&
                    metaWindow.get_window_type() !== Meta.WindowType.DESKTOP &&
                    !metaWindow.skip_taskbar
                );
            });

        // Check if at least one window is near enough to the panel.
        const panelTop = Main.panel.get_transformed_position()[1];
        const panelBottom = panelTop + Main.panel.get_height();
        const scale = St.ThemeContext.get_for_stage(global.stage).scale_factor;
        const isNearEnough = windows.some(metaWindow => {
            const verticalPosition = metaWindow.get_frame_rect().y;
            return verticalPosition < panelBottom + 5 * scale;
        });

        return isNearEnough;
    }

    _updateTransparent() {
        const disableForMaximizedWindow =
            this._settingsManager.getDisableOnFullscreen() &&
            this._isAnyWindowNearTopBar();

        if (disableForMaximizedWindow) {
            this._stylingClassManager.disableColoringClass();
            return;
        }

        const colorScheme = this._getTheme();
        const transparency =
            colorScheme == 'dark'
                ? this._settingsManager.getTransparencyDark()
                : this._settingsManager.getTransparencyLight();
        this._stylingClassManager.enableColoringClass(
            colorScheme,
            transparency
        );
    }

    _updateTransparentDelayed() {
        this._delayedTimeoutId = GLib.timeout_add(
            GLib.PRIORITY_DEFAULT,
            250,
            () => {
                this._updateTransparent();
                this._delayedTimeoutId = null;
                return GLib.SOURCE_REMOVE;
            }
        );
    }

    _getTheme() {
        if (Main.sessionMode.colorScheme !== 'prefer-light') {
            return 'dark';
        }
        const {colorScheme} = St.Settings.get();
        return colorScheme === St.SystemColorScheme.PREFER_DARK
            ? 'dark'
            : 'light';
    }
}
