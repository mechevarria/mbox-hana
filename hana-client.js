const hdbext = require('sap-hdbext-promisfied');
const simpleParser = require('mailparser').simpleParser;
const fs = require('fs');
const cliProgress = require('cli-progress');

const emailSql = `
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

const attachSQL = `
INSERT INTO "MBOX_SCHEMA"."ATTACHMENT" (
  MESSAGE_ID,
  FILENAME,
  CONTENT_TYPE,
  SIZE,
  CONTENT,
  CID
)
VALUES (?,?,?,?,?,?);
`;

const load = async (messages) => {
  const config = JSON.parse(fs.readFileSync('service-key.json'));
  const hana = await hdbext.createConnection(config);

  let bar1 = new cliProgress.SingleBar(
    {
      stopOnComplete: true,
    },
    cliProgress.Presets.shades_classic,
  );
  bar1.start(messages.length, 0);

  messages.forEach(async (msg) => {
    let parsed = {};
    try {
      parsed = await simpleParser(msg, {});
    } catch (error) {
      console.error('Parsing error', error);
      throw error;
    }
    const stringDate = `${parsed.date.getFullYear()}-${parsed.date.getMonth() + 1}-${parsed.date.getDate()}`;

    let bindParams = [
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
    try {
      await hana.exec(emailSql, bindParams);
      if (parsed.attachments.length > 0) {
        parsed.attachments.forEach(async (attachment) => {
          bindParams = [parsed.messageId, attachment.filename, attachment.contentType, attachment.size, attachment.content.toString(), attachment.cid];
          await hana.exec(attachSQL, bindParams);
        });
      }
      bar1.increment();
    } catch (error) {
      console.error('SQL error', error);
      throw error;
    }
  });
};

exports.load = load;
