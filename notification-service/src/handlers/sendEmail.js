import { SES } from "aws-sdk";

const ses = new SES({ region: "us-east-1" });

async function sendEmail(event, context) {
  const params = {
    Source: "koblosh.alex@gmail.com",
    Destination: {
      ToAddresses: ["koblosh.alex@gmail.com"],
    },
    Message: {
      Body: {
        Text: {
          Data: "Hello from my aws account",
        },
      },
      Subject: {
        Data: "Test Email",
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
