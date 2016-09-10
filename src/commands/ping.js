'use strict';

const _ = require('lodash');
const config = require('../config');
const ping = require('ping');
const tcpp = require('tcp-ping');

const msgDefaults = {
  response_type: 'in_channel',
  username: 'Piiing',
  icon_emoji: config('ICON_EMOJI')
};

const handler = (payload, res) => {
  const host = payload.text || '';
  
  tcpp.ping({ address: host, port: 80, attempts: 1, timeout: 1000 }, (err, data) => {
    if (err) {
      res.set('content-type', 'application/json');
      return res.status(200).json({
        msg: ':poop:, something went wrong while pinging `' + host + '`',
        error: err
      });
    }
    const deets = _.reduce(data.results, (current, next) => {
      return current += `${next.seq} => ${next.err ? next.err : ''}${next.time ? next.time + ' ms' : ''}\n`
    }, '');
    const text = `Attempts: ${data.attempts}\nAvg time: ${data.avg} ms\nMax time: ${data.max} ms\nMin time: ${data.min} ms\nDeets: ${deets}`;
    const attachments = {
      title: `Host: ${data.address}`,
      title_link: data.address,
      text,
      mrkdwn_in: ['text', 'pretext']
    };
  
    const msg = _.defaults({
      channel: payload.channel_name,
      title: 'Testing 123',
      attachments: {
        title_link: 'https://jperasmus.me',
        text: 'text goes here',
        markdwn_in: ['text', 'pretext']
      }
    }, msgDefaults);
  
    res.set('content-type', 'application/json');
    res.status(200).json(msg);
    return;
  });
  
  const msg = _.defaults({
    channel: payload.channel_name,
    title: 'Testing 123',
    attachments: {
      title_link: 'https://jperasmus.me',
      text: 'text goes here',
      markdwn_in: ['text', 'pretext']
    }
  }, msgDefaults);
  
  res.set('content-type', 'application/json');
  res.status(200).json(msg);
};

module.exports = { pattern: /ping/ig, handler: handler };
