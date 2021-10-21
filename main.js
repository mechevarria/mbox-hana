const Mbox = require('node-mbox');
const fs = require('fs');
const stream = fs.createReadStream('Inbox.mbox');
const cliProgress = require('cli-progress');
const mbox = new Mbox(stream);

const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const messages = [];

console.info('Loading mbox file');
mbox.on('message', (msg) => {
  messages.push(msg.toString);
});

mbox.on('error', (err) => {
  console.error('got an error', err);
});

mbox.on('end', () => {
  console.info('\nDone parsing mbox');
  console.info(`${messages.length} emails in mbox file`);

  // bar.start(messages.length, 0);

  // messages.forEach((msg) => {
  //   bar.increment();
  // });

  // bar.stop();
});
