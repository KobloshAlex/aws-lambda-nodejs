import { findAuctionById } from "./getAuction";
import { uploadPictureToS3 } from "../utils/uploadPictureToS3";
import { addImageUrl } from "../utils/addImageUrl";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import createError from "http-errors";

export async function uploadAuctionPicture(event) {
  const { id } = event.pathParameters;
  const { email } = event.requestContext.authorizer;

  const auction = await findAuctionById(id);

  if (auction.seller !== email) {
    throw new createError.Forbidden(
      "can not place image to auction that does not belongs to you"
    );
  }
  console.log(auction);

  const base64 = event.body.replace(/^data:image\/\w+;base64,/, "");
  const imageBuffer = Buffer.from(base64, "base64");

  let updatedAuction;
  try {
    const { Location } = await uploadPictureToS3(
      `${auction.id}.jpg`,
      imageBuffer
    );

    updatedAuction = await addImageUrl(Location, auction.id);
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ updatedAuction }),
  };
}

export const handler = middy(uploadAuctionPicture).use(httpErrorHandler());
