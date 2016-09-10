
'use strict'

const _ = require('lodash')
const config = require('../config')
const Botkit = require('botkit')

var controller = Botkit.slackbot({})
var bot = controller.spawn()

bot.configureIncomingWebhook({ url: config('WEBHOOK_URL') })

const msgDefaults = {
  response_type: 'in_channel',
  username: 'Piiing',
  icon_emoji: config('ICON_EMOJI')
}

