import St from "gi://St";

export class ShellEventManager {
  constructor() {
    this.actorSignals = new Map();
  }

  /**
   * @param {() => void)} callback
   */
  onColorSchemeChange(callback) {
    this._colorSchemeSignal = St.Settings.get().connect(
      "notify::color-scheme",
      callback
    );
  }

  /**
   * @param {() => void)} callback
   */
  onWorkspaceSwitch(callback) {
    this._workspaceSwitchSignal = global.window_manager.connect(
      "switch-workspace",
      callback
    );
  }

  /**
   * @param {() => void)} callback
   */
  onWindowPositionChange(callback) {
    const handleActorAdded = (metaWindowActor) => {
      const allocationSignal = metaWindowActor.connect(
        "notify::allocation",
        callback
      );
      const visibleSignal = metaWindowActor.connect(
        "notify::visible",
        callback
      );

      this.actorSignals.set(metaWindowActor, [allocationSignal, visibleSignal]);
    };

    for (const metaWindowActor of global.get_window_actors()) {
      this.handleActorAdded(metaWindowActor);
    }

    this._actorAddedSignal = global.window_group.connect(
      "actor-added",
      (_, metaWindowActor) => handleActorAdded(metaWindowActor)
    );

    this._actorRemovedSignal = global.window_group.connect(
      "actor-removed",
      (_, metaWindowActor) => {
        for (const signalId of this._windowSignalIds.get(metaWindowActor)) {
          metaWindowActor.disconnect(signalId);
        }
        this._windowSignalIds.delete(metaWindowActor);
        callback();
      }
    );
  }

  disconnect() {
    if (this._colorSchemeSignal) {
      St.Settings.get().disconnect(this._colorSchemeSignal);
    }
    if (this._workspaceSwitchSignal) {
      global.window_manager.disconnect(this._workspaceSwitchSignal);
    }

    if (this._actorAddedSignal) {
      global.window_group.disconnect(this._actorAddedSignal);
    }

    if (this._actorRemovedSignal) {
      global.window_group.disconnect(this._actorRemovedSignal);
    }
  }
}
