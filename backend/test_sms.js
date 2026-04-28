const accountSid = 'AC4c128d73ef84071bf23cdf61275a8fd0';
const authToken = 'f817e6f386efc5fecaec9fdb739db7ea';
const client = require('twilio')(accountSid, authToken);
client.messages
    .create({
        from: '+19478373760',
        to: '9044364813',
        body: "hello sample msg"
    })
    .then(message => console.log(message.sid));