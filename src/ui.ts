import "./ui.css";
import { PluginSettings } from "./helpers/settings";

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

const initUI = (settings: PluginSettings) => {
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

export interface PluginMessage {
  type: string;
  payload?: any;
}

onmessage = event => {
  const pluginMessage = event.data.pluginMessage as PluginMessage;

  switch (pluginMessage.type) {
    case "init":
      const settings = pluginMessage.payload.settings as PluginSettings;

      initUI(settings);
      break;
  }
};
