# mbox to hana

nodejs utility to parse email mbox files and persist to SAP HANA

Requires a file named `export.mbox` to be read

Requires a file named `config.json` with the SAP HANA database [connection properties](https://help.sap.com/viewer/f1b440ded6144a54ada97ff95dac7adf/2.10/en-US/4fe9978ebac44f35b9369ef5a4a26f4c.html)

Example:
```json
{
  "host": "zeus.hana.prod.some.region.com",
  "port": 555666,
  "user": "MBOX_SCHEMA_RT",
  "password": "some-long-password-with-numbers-888-AND-CAPS",
  "encrypt": true
}
```
