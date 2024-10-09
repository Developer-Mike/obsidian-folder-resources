import { setIcon, View, WorkspaceLeaf } from "obsidian";
import SharepointPlugin from "./main";

export default class SharepointView extends View {
  static readonly VIEW_TYPE = "sharepoint-view"

  static async openInNewTab(plugin: SharepointPlugin) {
    const leaves = plugin.app.workspace.getLeavesOfType(SharepointView.VIEW_TYPE)
    let leaf: WorkspaceLeaf | null = null

    if (leaves.length > 0) {
      leaf = leaves[0]
    } else {
      // Create a new leaf in the main workspace
      leaf = plugin.app.workspace.getLeaf(true)
      await leaf.setViewState({ type: SharepointView.VIEW_TYPE, active: true })
    } 

    plugin.app.workspace.revealLeaf(leaf)
  }

  private plugin: SharepointPlugin

  constructor(plugin: SharepointPlugin, leaf: WorkspaceLeaf) { 
    super(leaf)

    this.plugin = plugin
    this.leaf = leaf
  }

  getViewType(): string { return SharepointView.VIEW_TYPE }
  getDisplayText(): string { return "Sharepoint" }

  onload(): void {
    // @ts-ignore
    const webview = this.containerEl.createEl("webview") as any
    webview.id = "sharepointFrame"
    webview.src = this.plugin.settings.getSetting('sharepointUrl')

    this.createToolbar(webview)
    this.containerEl.appendChild(webview)
  }

  private createToolbar(webview: any) {
    const toolbar = this.containerEl.createEl("div")
    toolbar.id = "toolbar"
    this.containerEl.appendChild(toolbar)

    const back = this.containerEl.createEl("button")
    setIcon(back, "arrow-left")
    back.onclick = () => webview.goBack()
    toolbar.appendChild(back)

    const forward = this.containerEl.createEl("button")
    setIcon(forward, "arrow-right")
    forward.onclick = () => webview.goForward()
    toolbar.appendChild(forward)
  }
}