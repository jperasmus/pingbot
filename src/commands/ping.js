'use strict';

const _ = require('lodash');
const config = require('../config');
const ping = require('ping');
const tcpp = require('tcp-ping');

const msgDefaults = {
  response_type: 'in_channel',
  username: 'piiing',
  icon_emoji: config('ICON_EMOJI')
};

const handler = (payload, res) => {
  const host = payload.text || '';
  
  tcpp.ping({ address: host, port: 80, attempts: 5, timeout: 2000 }, (err, data) => {
    if (err) {
      res.set('content-type', 'application/json');
      return res.status(200).json({
        msg: ':poop:, something went wrong while pinging `' + host + '`',
        error: err
      });
    }
    const deets = _.reduce(data.results, (current, next) => {
      let number = '';
      switch (next.seq) {
        case 0:
          number = ':zero:';
          break;
        case 1:
          number = ':one:';
          break;
        case 2:
          number = ':two:';
          break;
        case 3:
          number = ':three:';
          break;
        case 4:
          number = ':four:';
          break;
        case 5:
          number = ':five:';
          break;
        case 6:
          number = ':six:';
          break;
      }
      return current += `${number} => ${next.err ? next.err : ''}${next.time ? next.time + ' ms' : ''}\n`
    }, '');
    const text = `*Attempts:* ${data.attempts}\n*Avg time:* ${data.avg} ms\n*Max time:* ${data.max} ms\n*Min time:* ${data.min} ms\n*Details:* ${deets}`;
    const attachments = [{
      title: `Host :computer: "${data.address}"`,
      title_link: data.address,
      text,
      mrkdwn_in: ['text', 'pretext']
    }];

    const msg = _.defaults({
      channel: payload.channel_name,
      title: 'Pinging ' + host,
      attachments
    }, msgDefaults);

    res.set('content-type', 'application/json');
    res.status(200).json(msg);
    return;
  });
};

module.exports = { pattern: /ping/ig, handler: handler };
