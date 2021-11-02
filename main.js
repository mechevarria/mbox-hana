const Mbox = require('node-mbox');
const fs = require('fs');
const stream = fs.createReadStream('export.mbox');
const cliProgress = require('cli-progress');
const mbox = new Mbox(stream);
const simpleParser = require('mailparser').simpleParser;
const hdbext = require('@sap/hdbext');

const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const messages = [];

console.info('Loading mbox file');

mbox.on('message', (msg) => {
  messages.push(msg);
});

mbox.on('error', (err) => {
  console.error('error in mbox loading', err);
});

mbox.on('end', () => {
  console.info('\nDone parsing mbox');
  console.info(`${messages.length} emails in mbox file`);

  const rawMsg = messages[0];
  const parseOptions = {};
  simpleParser(rawMsg, parseOptions)
    .then((parsed) => {
      console.info(parsed);
    })
    .catch((err) => {
      console.error('parsing error', err);
    });

  // bar.start(messages.length, 0);

  // messages.forEach((msg) => {
  //   bar.increment();
  // });

  // bar.stop();
  const configFile = fs.readFileSync('config.json');
  const config = JSON.parse(configFile);
  hdbext.createConnection(config, (error, client) => {
    if (error) {
      console.error('Connection error', error);
      throw error;
    }

    const sql = `
  SELECT SESSION_USER, CURRENT_SCHEMA 
  FROM "DUMMY"
  `;

    client.exec(sql, (err, result) => {
      if (err) {
        console.error('SQL error', err);
        throw err;
      }

      console.log(JSON.stringify(result));
    });
  });
});
