import SettingsManager from "./settings"
import IconsHelper from "./utils/icons-helper"
import { Plugin } from "obsidian"

export default class ExamplePlugin extends Plugin {
  settings: SettingsManager
  
	async onload() {
    IconsHelper.addIcons()
    
    this.settings = new SettingsManager(this)
    await this.settings.loadSettings()
    this.settings.addSettingsTab()
	}

  onunload() {}
}