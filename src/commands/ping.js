'use strict'

const _ = require('lodash')
const config = require('../config')
const ping = require('ping')
const tcpp = require('tcp-ping')

const msgDefaults = {
  response_type: 'in_channel',
  username: 'Piiing',
  icon_emoji: config('ICON_EMOJI')
}

const handler = (payload, res) => {
  const host = payload.text || ''
  
  tcpp.ping({ address: host, port: 80, attempts: 5, timeout: 5000 }, (err, data) => {
    if (err) {
      res.set('content-type', 'application/json')
      return res.status(200).json({
        msg: ':poop:, something went wrong while pinging `' + host + '`',
        error: err
      })
    }
    const deets = _.reduce(data.results, (current, next) => {
      return current += `${next.seq} => ${next.err ? next.err : ''}${next.time ? next.time + ' ms' : ''}
`
    }, '')
    const text = `*Attempts:* ${data.attempts}
*Avg time:* ${data.avg} ms
*Max time:* ${data.max} ms
*Min time:* ${data.min} ms
*Deets:* ${deets}
`
    
    const attachments = {
      title: `${data.address}`, // - ${res.alive ? 'It\'s alive!' : 'It\'s dead, Jim'}`,
      title_link: data.address,
      text,
      mrkdwn_in: ['text', 'pretext']
    }
  
    const msg = _.defaults({
      channel: payload.channel_name,
      attachments
    }, msgDefaults)
  
    res.set('content-type', 'application/json')
    return res.status(200).json(msg)
  });
}

module.exports = { pattern: /ping/ig, handler: handler }
