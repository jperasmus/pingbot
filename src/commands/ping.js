'use strict'

const _ = require('lodash')
const config = require('../config')
const ping = require('ping')

const msgDefaults = {
  response_type: 'in_channel',
  username: 'Piiing',
  icon_emoji: config('ICON_EMOJI')
}

const handler = (payload, res) => {
  const host = payload.text || ''
  
  ping.promise.probe(host, {
    timeout: 2,
    extra: ["-i 2"],
    min_reply: 3
  })
    .then((res) => {
      const attachments = {
        title: `${res.host} [in ${res.time}ms] - ${res.alive ? 'It\'s alive!' : 'It\'s dead, Jim'}`,
        title_link: res.host,
        text: `${res.output}`,
        mrkdwn_in: ['text', 'pretext']
      }
  
      const msg = _.defaults({
        channel: payload.channel_name,
        attachments
      }, msgDefaults)
  
      res.set('content-type', 'application/json')
      res.status(200).json(msg)
      return
    })
    .catch((err) => {
      res.set('content-type', 'application/json')
      res.status(500).json({
        msg: ':poop:, something went wrong with the `ping`.',
        error: err
      })
      return
    })
}

module.exports = { pattern: /ping/ig, handler: handler }
