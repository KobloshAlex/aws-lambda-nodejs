import { DynamoDB } from "aws-sdk";

const dynamodb = new DynamoDB.DocumentClient();

export async function addImageUrl(pictureUrl, id) {
  const params = {
    TableName: process.env.AUCTION_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set pictureUrl = :pictureUrl",
    ExpressionAttributeValues: {
      ":pictureUrl": pictureUrl,
    },
    ReturnValues: "ALL_NEW",
  };
  const result = await dynamodb.update(params).promise();

  return result.Attributes;
}
