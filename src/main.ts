import SettingsManager from "./settings"
import FolderResourcesView from "./folder-resources-view"
import IconsHelper from "./utils/icons-helper"
import { Plugin } from "obsidian"

export default class FolderResourcesPlugin extends Plugin {
  settings: SettingsManager
  
	async onload() {
    IconsHelper.addIcons()
    
    this.settings = new SettingsManager(this)
    await this.settings.loadSettings()
    this.settings.addSettingsTab()

    this.registerView(FolderResourcesView.VIEW_TYPE, (leaf) => new FolderResourcesView(this, leaf))

    this.addCommand({
      id: 'open-resources',
      name: 'Open Folder Resources',
      callback: () => FolderResourcesView.openInNewTab(this)
    })

    this.addRibbonIcon(
      'folder-symlink', 
      'Open Folder Resources', 
      () => FolderResourcesView.openInNewTab(this)
    )
	}

  onunload() {}
}