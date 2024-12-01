import { Version } from '#components'

const plugin = await (async () => {
  switch (Version.BotName) {
    case 'Karin':
      return (await import('node-karin')).Plugin
    default:
      return global.plugin
  }
})()

export default plugin
