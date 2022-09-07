import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

export async function closeAuction(auction) {
  const { id, title, seller, highestBid } = auction;
  const { amount, bidder } = highestBid;

  const params = {
    TableName: process.env.AUCTION_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set #status = :status",
    ExpressionAttributeValues: {
      ":status": "CLOSED",
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
  };

  await dynamoDb.update(params).promise();

  if (bidder) {
    const notifySeller = sqs
      .sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
          subject: "Your item has been sold",
          recipient: seller,
          body: `Greetings, your item "${title}" has been sold for ${amount}`,
        }),
      })
      .promise();

    const notifyBayer = sqs
      .sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
          subject: "You won an item!",
          recipient: bidder,
          body: `Greetings, your won "${title}" with $${amount}`,
        }),
      })
      .promise();

    return Promise.all([notifySeller, notifyBayer]);
  } else {
    return sqs
      .sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
          subject: `Your auction on ${title} has been closed`,
          recipient: seller,
          body: `Greetings, your items "${title}" has been closed without any  bid`,
        }),
      })
      .promise();
  }
}
