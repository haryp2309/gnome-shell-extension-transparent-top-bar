import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import {
    ExtensionPreferences,
    gettext as _,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const TRANSPARENCY = 'transparency-dark';
const TRANSPARENCY_DARK = 'transparency-dark';
const TRANSPARENCY_LIGHT = 'transparency-light';
const DARK_FULL_SCREEN = 'dark-full-screen';

export default class TransparentTopBarPrefsWidget extends ExtensionPreferences {
    addScale({colorName, existingOpacity, onChange}) {
        const group = new Adw.PreferencesGroup({
            title: _(colorName + ': Top bar opacity (%)'),
        });

        // scale
        const scale = new Gtk.Scale();
        scale.set_digits(0);
        scale.set_round_digits(0);

        scale.set_range(0, 100);
        scale.set_draw_value(true);

        // setting value last as it might not work if the scale is not set up properly
        scale.set_value(existingOpacity);
        scale.connect('value-changed', onChange);
        group.add(scale);
        return group;
    }

    buildOpaqueOnFullscreenOption(darkFullScreen) {
        // Switch for full opacity when window touch the bar

        const row = new Gtk.Box();
        row.set_orientation(Gtk.HORIZONTAL);
        row.set_margin_top(20);
        row.set_margin_bottom(20);
        //row.set_homogeneous(true);

        const sw = new Gtk.Switch();
        sw.set_active(darkFullScreen);
        sw.connect('state-set', sw => {
            window._settings.set_boolean(DARK_FULL_SCREEN, sw.get_active());
        });
        sw.set_halign(Gtk.Align.END);

        const label = Gtk.Label.new('Opaque top bar when a window touches it');
        label.set_hexpand(true);
        label.set_halign(Gtk.Align.START);

        row.append(label);
        row.append(sw);
        return row;
    }

    fillPreferencesWindow(window) {
        window._settings = this.getSettings('com.ftpix.transparentbar');
        const darkFullScreen = window._settings.get_boolean(DARK_FULL_SCREEN);

        const page = new Adw.PreferencesPage();

        const darkSliderGroup = this.addScale({
            colorName: 'Dark',
            existingOpacity: window._settings.get_int(TRANSPARENCY_DARK),
            onChange: scale => {
                window._settings.set_int(TRANSPARENCY_DARK, scale.get_value());
            },
        });
        page.add(darkSliderGroup);

        const lightSliderGroup = this.addScale({
            colorName: 'Light',
            existingOpacity: window._settings.get_int(TRANSPARENCY_LIGHT),
            onChange: scale => {
                window._settings.set_int(TRANSPARENCY_LIGHT, scale.get_value());
            },
        });
        page.add(lightSliderGroup);

        const group = new Adw.PreferencesGroup({title: _('Other options')});
        const row = this.buildOpaqueOnFullscreenOption(darkFullScreen);
        group.add(row);

        page.add(group);

        window.add(page);
    }

    onValueChanged(scale) {
        this.settings.set_int('transparency-dark', this._opacity.get_value());
    }

    onDarkFullScreenChanged(gtkSwitch) {
        this.settings.set_boolean(
            'dark-full-screen',
            this._darkFullScreen.get_active()
        );
    }
}
