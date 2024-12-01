import lodash from 'lodash'
import Version from './Version.js'
import { plugin, logger } from '#lib'
import Config from './Config.js'

const throttle = {}

export default class {
  constructor ({
    id,
    name,
    dsc,
    event = 'message',
    priority = 5
  }, rule) {
    this.id = id
    this.name = name
    this.dsc = dsc || name
    this.event = event
    this.priority = priority
    this.apps = []
    this.rule(rule)
  }

  rule (name, reg, fnc, cfg = {}) {
    if (!name) return false
    if (lodash.isPlainObject(name)) {
      lodash.forEach(name, (p, k) => {
        this.rule(k, p.reg, p.fnc, p.cfg)
      })
    } else {
      this.apps.push({ name, reg, fnc, cfg })
    }
  }

  create () {
    const { name, dsc, event, priority } = this
    const rule = []
    const cls = class extends plugin {
      constructor () {
        super({
          name: `[${Version.pluginName}]` + name,
          dsc: dsc || name,
          event,
          priority,
          rule
        })
      }
    }

    for (const { name, reg, fnc, cfg } of this.apps) {
      rule.push({
        reg,
        fnc: name,
        ...cfg
      })
      cls.prototype[name] = async (e) => {
        if (!Config.steam.apiKey && !/帮助|设置/.test(e.msg)) {
          await e.reply('没有配置apiKey不能调用Steam Web API哦\n先到https://steamcommunity.com/dev/apikey 申请一下apiKey\n然后使用 #steam设置apiKey + 申请到的apiKey\n之后再使用吧')
          return true
        }
        const key = `${name}:${e.user_id}`
        if (throttle[key]) {
          await e.reply('太快辣! 要受不了了🥵')
          return true
        } else {
          throttle[key] = setTimeout(() => {
            delete throttle[key]
          }, 1000 * 60)
        }
        let res = true
        try {
          res = await fnc(e)
        } catch (error) {
          logger.error(error)
          await e.reply(`出错辣! ${error.message}`)
        }
        clearTimeout(throttle[key])
        delete throttle[key]
        return res ?? true
      }
    }
    return cls
  }
}
