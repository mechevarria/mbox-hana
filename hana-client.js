const hdbext = require('@sap/hdbext');
const simpleParser = require('mailparser').simpleParser;
const cliProgress = require('cli-progress');

const load = (config, messages) => {
  hdbext.createConnection(config, (error, client) => {
    if (error) {
      console.error('Connection error', error);
      throw error;
    }

    const bar = new cliProgress.SingleBar({
        stopOnComplete: true,
      },
      cliProgress.Presets.shades_classic,
    );
    const parseOptions = {};
    bar.start(messages.length, 0);

    messages.forEach((msg, index) => {
      simpleParser(msg, parseOptions)
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

          const stringDate = `${parsed.date.getFullYear()}-${parsed.date.getMonth() + 1}-${parsed.date.getDate()}`
          
          const bindParams = [
            stringDate,
            parsed.messageId,
            parsed.from ? parsed.from.text : null,
            parsed.to ? parsed.from.text : null,
            parsed.cc ? parsed.cc.text : null,
            parsed.bcc ? parsed.bcc.text : null,
            parsed.subject,
            parsed.text,
            parsed.textAsHtml
          ];
          client.exec(sql, bindParams, (err, result) => {
            if (err) {
              console.error('SQL error', err);
              throw err;
            }
            //console.log(JSON.stringify(result));
            bar.increment();
          });
        })
        .catch((err) => {
          console.error('parsing error', err);
          bar.increment();
        });
    });
  });
};

exports.load = load;
