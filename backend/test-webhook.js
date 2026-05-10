const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/webhooks/casso', {
      error: 0,
      data: [
        {
          description: "128667960303-TS2605101639-CHUYEN TIEN-OQCH000BMyrx-MOMO128667960303MOMO",
          amount: 52000,
          when: "2026-05-10 21:41:00"
        },
        {
          description: "128670697341-TS2605102306-CHUYEN TIEN-OQCH000BN4W1-MOMO128670697341MOMO",
          amount: 52000,
          when: "2026-05-10 22:08:00"
        }
      ]
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.message);
  }
}
test();
