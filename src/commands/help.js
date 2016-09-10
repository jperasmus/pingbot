
'use strict'

const _ = require('lodash')
const config = require('../config')

const msgDefaults = {
  response_type: 'in_channel',
  username: 'Piiing',
  icon_emoji: config('ICON_EMOJI')
}

let attachments = [
  {
    title: 'Piiing allows you to quickly ping any server',
    color: '#2FA44F',
    text: '`/ping google.com` pings google.com to see if it is still kicking or fell over',
    mrkdwn_in: ['text']
  },
  {
    title: 'Configuring Piiing',
    color: '#E3E4E6',
    text: '`/ping help` ... you\'re lookin at it! \n',
    mrkdwn_in: ['text']
  }
]

const handler = (payload, res) => {
  let msg = _.defaults({
    channel: payload.channel_name,
    attachments: attachments
  }, msgDefaults)

  res.set('content-type', 'application/json')
  res.status(200).json(msg)
  return
}

module.exports = { pattern: /help/ig, handler: handler }
