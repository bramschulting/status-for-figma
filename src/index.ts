import { createBadgeForStatus, Status } from "./helpers/createBadge";
import { getBadgeForNode, setBadgeForNode } from "./helpers/badgeForNode";

const createBadges = async (status: Status) =>
  Promise.all(
    figma.currentPage.selection.map(async selectedNode => {
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
  );

switch (figma.command) {
  case "wip":
  case "ready-for-review":
  case "done":
    createBadges(figma.command as Status).then(() => figma.closePlugin());
    break;
  default:
    figma.closePlugin();
    break;
}
