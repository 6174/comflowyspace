let figma = null;
self.onmessage = (event: MessageEvent) => {
  handleRequest(event.data)
};

function handleRequest(data: any) {
  switch (data.type) {
    case 'init':
      postMessage({ type: 'init', figma: init() });
      break;

    case 'uiMessage':
      if (figma.ui.onmessage) {
        figma.ui.onmessage(data.msg);
      }
      break;
  }
}

function init() {
  figma = {
    ui: {
      onmessage: null,
      postMessage: msg => {
        postMessage({ type: 'uiMessage', msg });
      },
    },
    closePlugin: () => {
      postMessage({ type: 'close' });
    },
    // 更多的 API...
  };
  return figma;
}

