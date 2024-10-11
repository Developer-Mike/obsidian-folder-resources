import { IconName, setIcon, TFolder, View, WorkspaceLeaf } from "obsidian"
import FolderResourcesPlugin from "./main"
const { remote } = require('electron')
import { promises as fs } from 'fs'

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
  getIcon(): IconName { return "folder-symlink" }

  onload(): void {
    // @ts-ignore
    const webview = this.containerEl.createEl("webview") as any
    webview.id = "folderResourcesFrame"

    // Add download listener
    remote.session.defaultSession.on('will-download', this.onDownload.bind(this))

    this.path = this.plugin.app.workspace.getActiveFile()?.path?.split("/")?.slice(0, -1)?.join("/") ?? null
    if (this.path) {
      const folders = this.path.split("/")
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
    remote.session.defaultSession.off('will-download', this.onDownload.bind(this))
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

  private async onDownload(_event: any, item: any, _webContents: any) {
    // Check if active leaf is the current view
    if (this.plugin.app.workspace.getActiveViewOfType(FolderResourcesView) !== this) return

    if (!this.plugin.settings.getSetting('putDownloadsInNestedAttachmentsFolder')) return

    let targetRelativeFolder = this.plugin.settings.getSetting('attachmentsFolderName')
    if (this.path) targetRelativeFolder = `${this.path}/${targetRelativeFolder}`

    item.on('done', async (_event: any, _state: any) => {
      const filename = item.savePath.replaceAll("\\", "/").split("/").pop()
      // @ts-ignore
      const targetPath = `${this.plugin.app.vault.adapter.basePath.replaceAll("\\", "/")}/${targetRelativeFolder}/${filename}`

      // Create the folder if it doesn't exist
      const folder = this.plugin.app.vault.getAbstractFileByPath(targetRelativeFolder)
      if (!(folder instanceof TFolder)) await this.plugin.app.vault.createFolder(targetRelativeFolder)

      // Move the file to the attachments folder
      fs.rename(item.savePath, targetPath).then(() => {
        // Update file explorer
        this.plugin.app.metadataCache.trigger(`${targetRelativeFolder}/${filename}`)
      })
    })
  }
}