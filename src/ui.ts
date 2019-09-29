import { ReplaySubject, fromEvent } from "rxjs";
import { filter, map } from "rxjs/operators";
import { next } from "./helpers/next";
import { PluginSettings } from "./helpers/settings";
import "./ui.css";

function dispatchToPlugin(type: string, payload?: any) {
  parent.postMessage(
    {
      pluginMessage: {
        type,
        payload
      }
    },
    "*"
  );
}

function createSwitch(
  id: string,
  checked: boolean,
  labelText: string,
  onChange: (event: Event) => void
) {
  const wrapper = document.createElement("div");
  const input = document.createElement("input");
  const label = document.createElement("label");

  wrapper.classList.add("switch");

  input.classList.add("switch__toggle");
  input.type = "checkbox";
  input.id = id;
  input.checked = checked;
  input.onchange = onChange;

  label.classList.add("switch__label");
  label.setAttribute("for", id);
  label.innerText = labelText;

  wrapper.appendChild(input);
  wrapper.appendChild(label);

  return wrapper;
}

const initSettingsUI = (settings: PluginSettings) => {
  const groupBadgeSwitch = createSwitch(
    "toggleGroupBadge",
    settings.shouldGroupBadgeAndElement,
    "Group element and status badge",
    event => {
      const checkbox = event.target as HTMLInputElement;

      dispatchToPlugin("settings-changed", {
        settings: {
          ...settings,
          shouldGroupBadgeAndElement: checkbox.checked
        }
      });
    }
  );

  document.body.appendChild(groupBadgeSwitch);
};

const initCustomStatusUI = (settings: PluginSettings) => {
  settings.customStatuses.forEach(customStatus => {
    const button = document.createElement("button");
    button.innerText = customStatus.text;
    const buttonClick$ = fromEvent(button, "click");

    buttonClick$.subscribe({
      next: () => {
        dispatchToPlugin("set-custom-status", customStatus);
      }
    });

    document.body.appendChild(button);
  });
};

export interface PluginMessage {
  type: string;
  payload?: any;
}

// Definition of the streams. Simply subscribing to a stream should have no side effects

/** Stream of messages coming from the non-UI part of the plugin */
const message$ = new ReplaySubject<MessageEvent>();
onmessage = message => {
  message$.next(message);
};

/** Stream of `PluginMessage`s coming from the non-UI part of the plugin */
const pluginMessage$ = message$.pipe(
  filter(message => message.data.pluginMessage.type !== undefined),
  map(message => message.data.pluginMessage as PluginMessage)
);

/** Stream of messages signaling the settings UI can be initiated */
const initSettingsMessage$ = pluginMessage$.pipe(
  filter(message => message.type === "init-settings")
);

/** Stream of messages signaling the custom status UI can be initiated */
const initCustomStatusMessage$ = pluginMessage$.pipe(
  filter(message => message.type === "init-custom-status")
);

// Subscribe to streams. This is where the side effects should take place.

// Init settings UI
initSettingsMessage$.subscribe(
  next(message => {
    const settings = message.payload.settings as PluginSettings;
    initSettingsUI(settings);
  })
);

// Init custom status UI
initCustomStatusMessage$.subscribe(
  next(message => {
    const settings = message.payload.settings as PluginSettings;
    initCustomStatusUI(settings);
  })
);
