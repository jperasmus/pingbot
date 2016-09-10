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
  const host = payload.text || 'google.com'
  
  ping.promise.probe(host)
    .then((res) => {
      console.log(res)
      var attachments = {
        title: `${res.alive} - ${res.host} [${res.time}] `,
        title_link: res.host,
        text: `${res.output}`,
        mrkdwn_in: ['text', 'pretext']
      }
  
      let msg = _.defaults({
        channel: payload.channel_name,
        attachments: attachments
      }, msgDefaults)
  
      res.set('content-type', 'application/json')
      res.status(200).json(msg)
      return
    })
    .catch((err) => {
      res.set('content-type', 'application/json')
      res.status(500).json({ msg: 'Poop, something went wrong with the `ping`.'})
    })
}

module.exports = { pattern: /repos/ig, handler: handler }
