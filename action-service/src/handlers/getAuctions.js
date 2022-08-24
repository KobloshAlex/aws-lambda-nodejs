import AWS from "aws-sdk";
import commonMiddleware from "../utils/commonMiddleware";
import createError from "http-errors";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  let auctions;
  try {
    auctions = await dynamoDb
      .scan({
        TableName: process.env.AUCTION_TABLE_NAME,
      })
      .promise();
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions.Items),
  };
}

export const handler = commonMiddleware(getAuctions);
