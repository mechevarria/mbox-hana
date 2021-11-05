const Mbox = require('node-mbox');
const fs = require('fs');
const hanaClient = require('./hana-client');

console.info('Loading mbox file');
const stream = fs.createReadStream('export.mbox');
const mbox = new Mbox(stream);
const messages = [];

mbox.on('message', (msg) => {
  messages.push(msg);
});

mbox.on('error', (err) => {
  console.error('error in mbox loading', err);
});

mbox.on('end', () => {
  console.info('\nDone parsing mbox');
  console.info(`${messages.length} emails in mbox file`);

  const configFile = fs.readFileSync('hana.json');
  const hanaConfig = JSON.parse(configFile);

  hanaClient.load(hanaConfig, messages);
});
