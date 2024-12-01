import { App } from '#components'

const app = {
  id: 'RSS',
  name: '绑定Steam'
}

export const rule = {
  RSS: {
    reg: /^#?RSS检查更新$/i,
    fnc: async e => {
      return true
    }
  }
}

export const RSS = new App(app, rule).create()
