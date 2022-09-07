import { SES } from "aws-sdk";

const ses = new SES({ region: "us-east-1" });

async function sendEmail(event, context) {
  const email = event.Records[0];
  console.log(email);
  const { subject, body, recipient } = JSON.parse(email.body);

  const params = {
    Source: "koblosh.alex@gmail.com",
    Destination: {
      ToAddresses: [recipient],
    },
    Message: {
      Body: {
        Text: {
          Data: body,
        },
      },
      Subject: {
        Data: subject,
      },
    },
  };

  return ses.sendEmail(params).promise().then(console.log).catch(console.error);

  // try {
  //   const sendMailResult = await ses.sendEmail(params).promise();
  //   console.log(sendMailResult);
  // } catch (error) {
  //   console.error(error);
  // }
}

export const handler = sendEmail;
