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
    const readme = marked(data.toString());
    const content = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="description" content="Building Morgage Loans">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>iBuild Home Loans</title>
    <link rel="stylesheet" href="https://sindresorhus.com/github-markdown-css/github-markdown.css">
    <style>
        .markdown-body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
        }
    </style>
  </head>
  <body>
    <main class="markdown-body">${readme}</main>
  </body>
</html>`;
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
