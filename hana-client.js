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
          //console.info(parsed);
          const sql = `
          SELECT SESSION_USER, CURRENT_SCHEMA 
          FROM "DUMMY"
          `;

          client.exec(sql, (err, result) => {
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
