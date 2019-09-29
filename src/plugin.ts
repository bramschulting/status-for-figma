import { Observable, merge } from "rxjs";
import { filter, map } from "rxjs/operators";
import {
  Status,
  textForStatus,
  colorForStatus,
  createBadge
} from "./helpers/createBadge";
import { getBadgeForNode, setBadgeForNode } from "./helpers/badgeForNode";
import {
  loadSettings,
  updateSettings,
  PluginSettings
} from "./helpers/settings";
import { PluginMessage } from "./ui";
import { next } from "./helpers/next";

const createBadges = async (
  text: string,
  color: RGB,
  settings: PluginSettings
): Promise<string | undefined> => {
  const { selection } = figma.currentPage;

  if (selection.length <= 0) {
    return Promise.resolve("Please select at least one element");
  }

  return Promise.all(
    selection.map(async selectedNode => {
      // Remove existing badge
      const currentBadge = getBadgeForNode(selectedNode);
      if (currentBadge) {
        currentBadge.remove();
      }

      // Create the new badge
      const badge = await createBadge(text, color);
      badge.x = selectedNode.x;
      badge.y = selectedNode.y - badge.height - 40;

      // Add new badge to the parent of the selected node, or to the current page
      const containingNode = selectedNode.parent || figma.currentPage;
      containingNode.appendChild(badge);

      // Link badge to selected node for future reference
      setBadgeForNode(selectedNode, badge);

      // Add badge and node to group if needed
      if (settings.shouldGroupBadgeAndElement) {
        // If the current parent is a group containing only the selected node and badge, we can just use that one
        const isAlreadyGrouped =
          containingNode.type === "GROUP" &&
          containingNode.children.length === 2;

        // If there's no group, we create one
        if (!isAlreadyGrouped) {
          figma.group([badge, selectedNode], containingNode);
        }

        // Always make sure the name of the group is up to date
        selectedNode.parent.name = `${selectedNode.name} - ${text}`;
      }
    })
  ).then(() => undefined);
};

function dispatchToUI(type: string, payload?: any) {
  figma.ui.postMessage({
    type,
    payload
  });
}

const openSettingsUI = () => {
  // Show settings UI, this will be empty
  figma.showUI(__html__);
  figma.ui.resize(300, 72);

  // Init the settings UI with data
  loadSettings().then(settings => {
    dispatchToUI("init-settings", { settings });
  });
};

const openCustomStatusUI = () => {
  // Show the custom status UI
  figma.showUI(__html__);

  // Init the settings UI with data
  loadSettings().then(settings => {
    dispatchToUI("init-custom-status", { settings });
  });
};

// Definition of the streams. Simply subscribing to a stream should have no side effects

/** Stream of messages coming from the plugin UI */
const uiMessage$ = new Observable<any>(subscriber => {
  figma.ui.onmessage = event => {
    subscriber.next(event);
  };
});

/** Stream of `PluginMessage`s coming from the UI part of the plugin */
const pluginMessage$ = uiMessage$.pipe(
  filter(event => event.type !== undefined),
  map(event => ({ type: event.type, payload: event.payload } as PluginMessage))
);

/** Stream of messages signaling that the settings have been changed */
const settingsChangedMessage$ = pluginMessage$.pipe(
  filter(message => message.type === "settings-changed")
);

/** Stream of messages signaling a custom status has been selected */
const customStatusMessage$ = pluginMessage$.pipe(
  filter(message => message.type === "set-custom-status")
);

/** Stream of custom `text` and `color` status combinations */
const customStatus$ = customStatusMessage$.pipe(
  map(message => ({
    text: message.payload.text as string,
    color: message.payload.color as RGB
  }))
);

/** Stream of incoming Figma commands (from the plugin menu) */
const command$ = new Observable<string>(subscriber => {
  subscriber.next(figma.command);
  subscriber.complete();
});

/** Stream of commands signaling a preset status menu item has been selected */
const statusCommand$ = command$.pipe(
  filter(command => ["wip", "ready-for-review", "done"].includes(command))
);

/** Stream of preset `text` and `color` status combinations */
const presetStatus$ = statusCommand$.pipe(
  map(command => command as Status),
  map(status => ({
    text: textForStatus(status),
    color: colorForStatus(status)
  }))
);

/** Stream of commands signaling the 'Custom' menu item has been selected */
const customCommand$ = command$.pipe(filter(command => command === "custom"));

/** Stream of commands signaling the 'Settings' menu item has been selected */
const settingsCommand$ = command$.pipe(
  filter(command => command === "settings")
);

// Subscribe to streams. This is where the side effects should take place.

// Open settings UI
settingsCommand$.subscribe(next(openSettingsUI));

// Update plugin settings
settingsChangedMessage$.subscribe(
  next(async message => {
    const nextSettings = message.payload.settings as PluginSettings;
    await updateSettings(nextSettings);
  })
);

// Open custom status UI
customCommand$.subscribe(next(openCustomStatusUI));

// Create badges, either via the stream of preset statuses of the stream of custom statuses
merge(presetStatus$, customStatus$).subscribe(
  next(async ({ text, color }) => {
    const settings = await loadSettings();
    const message = await createBadges(text, color, settings);

    figma.closePlugin(message);
  })
);
