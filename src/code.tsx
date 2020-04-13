figma.showUI(__html__, {
  width: 480,
  height: 320,
});

const currentNodes = figma.currentPage.selection;

if (currentNodes.length < 1) {
  figma.notify('Please select one node');
  figma.closePlugin();
}

if (currentNodes.length > 1) {
  figma.notify('Please select only one node');
  figma.closePlugin();
}

const selectedNode = figma.root.findOne(
  (node) => node.id === currentNodes[0].id
);

if (!!(selectedNode as any).findAll) {
  const selectedComponentTextNodes = (selectedNode as GroupNode).findAll(
    (node) => node.type === 'TEXT'
  ) as TextNode[];

  if (selectedComponentTextNodes.length > 0) {
    // uiスレッドにそのままNode渡すとなぜかプロパティが undefined になるので成形してから渡す
    const conmponentsData = selectedComponentTextNodes.map((node) => ({
      id: node.id,
      name: node.name,
      value: node.characters,
    }));
    figma.ui.postMessage(conmponentsData);
  }
}

// when cloning element, IDs of decendants also change
function createIdMap(
  node: GroupNode,
  cloneNode: GroupNode,
  textNodeIds: string[]
) {
  const indexes = [];

  node.children.forEach((node, index) => {
    if (textNodeIds.indexOf(node.id) > -1) {
      indexes.push(index);
    }
  });

  return indexes.reduce(
    (prev, current) => ({
      ...prev,
      [node.children[current].id]: cloneNode.children[current].id,
    }),
    {}
  );
}

figma.ui.onmessage = async (message) => {
  if (message.type === 'generate') {
    const values = message.values as { [key in string]: string }[];

    values.forEach(async (texts, index) => {
      const clone = selectedNode.clone() as GroupNode;
      const map = createIdMap(
        selectedNode as GroupNode,
        clone,
        Object.keys(texts)
      );

      Object.keys(texts).forEach(async (key) => {
        const textNode = clone.findOne((node) => {
          return node.id === map[key];
        }) as TextNode;
        if (textNode) {
          await figma.loadFontAsync(textNode.fontName as FontName);
          textNode.characters = texts[key];
        }
      });

      clone.y = clone.y + clone.height * (index + 1);
      selectedNode.parent.appendChild(clone);
    });

    figma.closePlugin();
  }
};
