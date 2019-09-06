import { createBadgeForStatus, Status } from "./helpers/createBadge";
import { getBadgeForNode, setBadgeForNode } from "./helpers/badgeForNode";
import {
  loadSettings,
  updateSettings,
  PluginSettings
} from "./helpers/settings";
import { PluginMessage } from "./ui";

const createBadges = async (status: Status): Promise<string | undefined> => {
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
      const badge = await createBadgeForStatus(status);
      badge.x = selectedNode.x;
      badge.y = selectedNode.y - badge.height - 40;

      // Add new badge to the parent of the selected node, or to the current page
      const containingNode = selectedNode.parent || figma.currentPage;
      containingNode.appendChild(badge);

      // Link badge to selected node for future reference
      setBadgeForNode(selectedNode, badge);
    })
  ).then(() => undefined);
};

const openSettings = () => {
  // Show settings UI, this will be empty
  figma.showUI(__html__);
  figma.ui.resize(300, 72);

  // Init the settings UI with data
  loadSettings().then(settings => {
    figma.ui.postMessage({
      type: "init",
      payload: { settings }
    });
  });
};

figma.ui.onmessage = event => {
  // Make sure this is a PluginMessage
  if (!event.type) {
    return;
  }

  const { type, payload } = event as PluginMessage;

  switch (type) {
    case "settings-changed":
      const nextSettings = payload.settings as PluginSettings;
      updateSettings(nextSettings);
      break;
  }
};

switch (figma.command) {
  case "wip":
  case "ready-for-review":
  case "done":
    createBadges(figma.command as Status).then(message =>
      figma.closePlugin(message)
    );
    break;
  case "settings":
    openSettings();
    break;
  default:
    figma.closePlugin();
    break;
}
