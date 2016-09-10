'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const marked = require('marked');
const proxy = require('express-http-proxy');
const bodyParser = require('body-parser');
const _ = require('lodash');
const config = require('./config');
const commands = require('./commands');
const helpCommand = require('./commands/help');
let bot = require('./bot');
let app = express();

if (config('PROXY_URI')) {
  app.use(proxy(config('PROXY_URI'), {
    forwardPath: (req, res) => { return require('url').parse(req.url).path }
  }))
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  fs.readFile(path.resolve(__dirname, '..', 'README.md'), (err, data) => {
    if (err) throw err;
    // TODO: Add styling to content
    const content = marked(data.toString());
    res.send(content);
  });
});

app.post('/commands/pingbot', (req, res) => {
  let payload = req.body;

  if (!payload || payload.token !== config('PINGBOT_COMMAND_TOKEN')) {
    let err = '✋  Ping—what? An invalid slash token was provided\n' +
              '   Is your Slack slash token correctly configured?';
    console.log(err);
    res.status(401).end(err);
    return;
  }

  let cmd = _.reduce(commands, (a, cmd) => {
    return payload.command.match(cmd.pattern) ? cmd : a;
  }, helpCommand);

  cmd.handler(payload, res);
});

app.listen(config('PORT'), (err) => {
  if (err) throw err;

  console.log(`\n🚀  Pingbot LIVES on PORT ${config('PORT')} 🚀`);

  if (config('SLACK_TOKEN')) {
    console.log(`🤖  beep boop: @pingbot is real-time\n`);
    bot.listen({ token: config('SLACK_TOKEN') });
  }
});
