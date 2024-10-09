import { addIcon } from "obsidian"

const CUSTOM_ICONS = {

} as { [id: string]: string }

export default class IconsHelper {
  static addIcons() {
    for (const [id, svg] of Object.entries(CUSTOM_ICONS)) {
      addIcon(id, svg)
    }
  }
}