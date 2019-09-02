const PLUGIN_DATA_KEY = "status-badge-id";

interface PluginData {
  nodeId: string;
  badgeId: string;
}

/**
 * Convert a JSON string into a PluginData object
 * @param encodedPluginData
 */
export const decodePluginData = (
  encodedPluginData: string
): PluginData | undefined => {
  const { nodeId, badgeId } = JSON.parse(encodedPluginData);

  if (!nodeId || !badgeId) {
    return;
  }

  return { nodeId, badgeId } as PluginData;
};

/**
 * Get the decoded plugin data for the passed node
 * @param node Parent node
 */
export const getPluginDataForNode = (
  node: BaseNode
): PluginData | undefined => {
  const pluginData = node.getPluginData(PLUGIN_DATA_KEY);
  if (!pluginData) {
    return;
  }

  return decodePluginData(pluginData);
};

/**
 * Get the badge node for the passed parent node
 * @param node Badge node
 */
export const getBadgeForNode = (node: BaseNode): BaseNode | undefined => {
  const pluginData = getPluginDataForNode(node);
  if (!pluginData) {
    return;
  }

  // Make sure the stored nodeId matches the ID of this node. When duplicating
  // a frame, the plugin data is also duplicated. We need to make sure we don't
  // update the status of the 'orignal node'.
  if (pluginData.nodeId !== node.id) {
    return;
  }

  return figma.getNodeById(pluginData.badgeId);
};

/**
 * Convert the input to a JSON string so it can be stored in a node
 * @param nodeId The ID of the parent node
 * @param badgeId The ID of the badge node
 */
export const encodePluginData = (nodeId: string, badgeId: string) =>
  JSON.stringify({ nodeId, badgeId });

/**
 * Link the ID of a badge to the node so it can be found later
 * @param node Parent node
 * @param badgeId ID of badge node
 */
export const setBadgeIdForNode = (node: BaseNode, badgeId: string) =>
  node.setPluginData(PLUGIN_DATA_KEY, encodePluginData(node.id, badgeId));

/**
 * Link a badge to the node so it can be found later
 * @param node Parent node
 * @param badge Badge node
 */
export const setBadgeForNode = (node: BaseNode, badge: BaseNode) =>
  setBadgeIdForNode(node, badge.id);
