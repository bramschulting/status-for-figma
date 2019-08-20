export enum Status {
  WIP = "wip",
  ReadyForReview = "ready-for-review",
  Done = "done"
}

const colorForStatus = (status: Status): RGB => {
  switch (status) {
    case Status.WIP:
      return { r: 235 / 255, g: 87 / 255, b: 87 / 255 };
    case Status.ReadyForReview:
      return { r: 255 / 255, g: 152 / 255, b: 0 / 255 };
    case Status.Done:
      return { r: 46 / 255, g: 204 / 255, b: 113 / 255 };
  }
};

const textForStatus = (status: Status): string => {
  switch (status) {
    case Status.WIP:
      return "Work in progress";
    case Status.ReadyForReview:
      return "Ready for review";
    case Status.Done:
      return "Done";
  }
};

const createBadge = async (text: string, color: RGB) => {
  const fontName: FontName = {
    family: "Roboto",
    style: "Bold"
  };

  await figma.loadFontAsync(fontName);

  const width = 120;
  const height = 30;

  const frame = figma.createFrame();
  frame.name = `Status - ${text}`;
  frame.resize(width, height);
  frame.backgrounds = [];

  const backgroundNode = figma.createRectangle();
  backgroundNode.name = "Background";
  backgroundNode.locked = true;
  backgroundNode.resize(frame.width, frame.height);
  backgroundNode.fills = [
    {
      type: "SOLID",
      color
    }
  ];
  backgroundNode.cornerRadius = 4.0;

  const textNode = figma.createText();
  textNode.locked = true;
  textNode.resize(frame.width, frame.height);
  textNode.fontName = fontName;
  textNode.characters = text;
  textNode.textAlignHorizontal = "CENTER";
  textNode.textAlignVertical = "CENTER";
  textNode.fills = [
    {
      type: "SOLID",
      color: { r: 1, g: 1, b: 1 }
    }
  ];

  frame.appendChild(backgroundNode);
  frame.appendChild(textNode);

  return frame;
};

export const createBadgeForStatus = async (status: Status) =>
  createBadge(textForStatus(status), colorForStatus(status));
