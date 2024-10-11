import { setIcon, View, WorkspaceLeaf } from "obsidian"
import FolderResourcesPlugin from "./main"
const { remote } = require('electron')

export default class FolderResourcesView extends View {
  static readonly VIEW_TYPE = "folder-resources-view"

  static async openInNewTab(plugin: FolderResourcesPlugin) {
    const leaf = plugin.app.workspace.getLeaf(true)
    await leaf.setViewState({ type: FolderResourcesView.VIEW_TYPE, active: true })

    plugin.app.workspace.revealLeaf(leaf)
  }

  private plugin: FolderResourcesPlugin
  private path: string | null
  private folder: string | null

  constructor(plugin: FolderResourcesPlugin, leaf: WorkspaceLeaf) { 
    super(leaf)

    this.plugin = plugin
    this.leaf = leaf
  }

  getViewType(): string { return FolderResourcesView.VIEW_TYPE }
  getDisplayText(): string { return this.folder ? `Resources (${this.folder})` : "Resources" }

  onload(): void {
    // @ts-ignore
    const webview = this.containerEl.createEl("webview") as any
    webview.id = "folderResourcesFrame"

    // Add download listener
    remote.session.defaultSession.on('will-download', this.onDownload)

    this.path = this.plugin.app.workspace.getActiveFile()?.path ?? null
    if (this.path) {
      const folders = this.path.split("/").slice(0, -1)
      webview.src = Object.entries(this.plugin.settings.getSetting('specificResourceUrls')).find(([folder, _url]) => {
        if (folders.includes(folder)) {
          this.folder = folder
          return true
        } else return false
      })?.[1]
    }
    if (!webview.src) webview.src = this.plugin.settings.getSetting('defaultResourceUrl')

    this.createToolbar(webview)
    this.containerEl.appendChild(webview)
  }

  onunload(): void {
    const webview = this.containerEl.querySelector("webview") as any
    webview.remove()
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

  private onDownload(event: any, item: any, webContents: any) {
    console.log("will-download", item.getURL())
  }
}