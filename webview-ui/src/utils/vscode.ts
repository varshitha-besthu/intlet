declare function acquireVsCodeApi(): {
  postMessage: (msg: any) => void;
  getState: () => any;
  setState: (newState: any) => void;
};

let vscodeApi: ReturnType<typeof acquireVsCodeApi> | undefined;

export function getVSCodeAPI() {
  if (!vscodeApi) {
    vscodeApi = acquireVsCodeApi();
  }
  return vscodeApi;
}

export const vscode = getVSCodeAPI();
