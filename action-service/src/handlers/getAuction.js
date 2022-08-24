import AWS from "aws-sdk";
import commonMiddleware from "../utils/commonMiddleware";
import createError from "http-errors";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function getAuction(event, context) {
  let auction;

  const { id } = event.pathParameters;

  try {
    auction = await dynamoDb
      .get({
        TableName: process.env.AUCTION_TABLE_NAME,
        Key: { id },
      })
      .promise();
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  const { Item } = auction;

  if (!Item) throw new createError.NotFound(`Auction with id ${id} not found`);

  return {
    statusCode: 200,
    body: JSON.stringify(Item),
  };
}

export const handler = commonMiddleware(getAuction);
