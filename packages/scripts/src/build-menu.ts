import fs from 'node:fs/promises'
import path from 'node:path'
import { buildMenu } from './services/menu'

export const buildMenus = async () => {
  const menus = await buildMenu()
  const filename = 'prebuild/menu.json'
  const dir = path.dirname(filename)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(filename, JSON.stringify(menus, null, 2))
}
