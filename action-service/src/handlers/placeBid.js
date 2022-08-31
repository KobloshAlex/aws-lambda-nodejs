import AWS from "aws-sdk";
import commonMiddleware from "../utils/commonMiddleware";
import createError from "http-errors";
import { findAuctionById } from "./getAuction";
import validator from "@middy/validator";
import placeBitSchema from "../utils/schemas/placeBitSchema";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function getAuction(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const { email } = event.requestContext.authorizer;

  const auction = await findAuctionById(id);

  if (auction.status !== "OPEN") {
    throw new createError.BadRequest("Can not bid on closed auction");
  }

  if (!auction.highestBid || auction.highestBid.amount >= amount) {
    throw new createError.BadRequest(
      `Bid amount must be higher than ${auction.highestBid.amount} bid amount`
    );
  }

  if (auction.seller === email) {
    throw new createError.BadRequest("Can not bid on your item");
  }

  if (auction.highestBid.bidder === email) {
    throw new createError.BadRequest("You bid is already placed");
  }

  const params = {
    TableName: process.env.AUCTION_TABLE_NAME,
    Key: { id },
    UpdateExpression:
      "set highestBid.amount = :amount, highestBid.bidder = :bidder",
    ExpressionAttributeValues: {
      ":amount": amount,
      ":bidder": email,
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

export const handler = commonMiddleware(getAuction).use(
  validator({
    inputSchema: placeBitSchema,
    ajvOptions: { useDefaults: true, strict: true },
  })
);
