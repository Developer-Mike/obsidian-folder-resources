import SettingsManager from "./settings"
import SharepointView from "./sharepoint-view"
import IconsHelper from "./utils/icons-helper"
import { Plugin } from "obsidian"

export default class SharepointPlugin extends Plugin {
  settings: SettingsManager
  
	async onload() {
    IconsHelper.addIcons()
    
    this.settings = new SettingsManager(this)
    await this.settings.loadSettings()
    this.settings.addSettingsTab()

    this.registerView(SharepointView.VIEW_TYPE, (leaf) => new SharepointView(this, leaf))

    this.addCommand({
      id: 'open-sharepoint',
      name: 'Open Sharepoint',
      callback: () => SharepointView.openInNewTab(this)
    })

    this.addRibbonIcon(
      'folder-symlink', 
      'Open Sharepoint', 
      () => SharepointView.openInNewTab(this)
    )
	}

  onunload() {}
}