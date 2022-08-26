import AWS from "aws-sdk";
import commonMiddleware from "../utils/commonMiddleware";
import createError from "http-errors";
import { findAuctionById } from "./getAuction";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function getAuction(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;

  const auction = await findAuctionById(id);

  if (!auction.highestBid || auction.highestBid.amount >= amount) {
    throw new createError.BadRequest(
      `Bid amount must be higher than ${auction.highestBid.amount} bid amount`
    );
  }

  const params = {
    TableName: process.env.AUCTION_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set highestBid.amount = :amount",
    ExpressionAttributeValues: {
      ":amount": amount,
    },
    ReturnValues: "ALL_NEW",
  };

  let updatedAuction;

  try {
    const { Attributes } = await dynamoDb.update(params).promise();
    updatedAuction = Attributes;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = commonMiddleware(getAuction);
