const PLUGIN_DATA_KEY = "status-badge-id";

export const findBadgeIdForNode = (node: BaseNode): string | undefined =>
  node.getPluginData(PLUGIN_DATA_KEY);

export const findBadgeForNode = (node: BaseNode): BaseNode | undefined => {
  const badgeId = findBadgeIdForNode(node);
  return figma.getNodeById(badgeId);
};

export const setBadgeIdForNode = (node: BaseNode, badgeId: string) =>
  node.setPluginData(PLUGIN_DATA_KEY, badgeId);

export const setBadgeForNode = (node: BaseNode, badge: BaseNode) =>
  setBadgeIdForNode(node, badge.id);
