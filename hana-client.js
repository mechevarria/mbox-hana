const hdbext = require('@sap/hdbext');
const fs = require('fs');
const simpleParser = require('mailparser').simpleParser;
const cliProgress = require('cli-progress');

const init = (count) => {
  return new Promise((resolve, reject) => {
    try {
      this.bar1 = new cliProgress.SingleBar(
        {
          stopOnComplete: true,
        },
        cliProgress.Presets.shades_classic,
      );

      this.bar1.start(count, 0);

      const config = JSON.parse(fs.readFileSync('service-key.json'));
      hdbext.createConnection(config, (err, client) => {
        if (err) {
          console.error('Connection error', err);
          throw err;
        }
        this.hana = client;
        resolve(true);
      });
    } catch (err) {
      reject(err);
    }
  });
};

const loadRecurse = (messages) => {
  if (messages.length == 0) {
    return;
  } else {
    const msg = messages.shift();

    simpleParser(msg, {})
      .then((parsed) => {
        const sql = `
            INSERT INTO "MBOX_SCHEMA"."EMAIL" (
              EMAIL_DATE,
              MESSAGE_ID,
              FROM_ADDRESS,
              TO_ADDRESS,
              CC_ADDRESS,
              BCC_ADDRESS,
              SUBJECT,
              TEXT,
              TEXT_AS_HTML
            )
            VALUES (TO_DATE(?, 'YYYY-MM-DD'),?,?,?,?,?,?,?,?);
            `;

        const stringDate = `${parsed.date.getFullYear()}-${parsed.date.getMonth() + 1}-${parsed.date.getDate()}`;

        const bindParams = [
          stringDate,
          parsed.messageId,
          parsed.from ? parsed.from.text : null,
          parsed.to ? parsed.from.text : null,
          parsed.cc ? parsed.cc.text : null,
          parsed.bcc ? parsed.bcc.text : null,
          parsed.subject,
          parsed.text,
          parsed.textAsHtml,
        ];
        this.hana.exec(sql, bindParams, (err, result) => {
          if (err) {
            console.error('SQL error', err);
            throw err;
          }
          this.bar1.increment();
          loadRecurse(messages);
        });
      })
      .catch((err) => {
        console.error('parsing error', err);
      });
  }
};

exports.init = init;
exports.loadRecurse = loadRecurse;
