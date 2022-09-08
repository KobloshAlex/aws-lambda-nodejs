import { findAuctionById } from "./getAuction";
import { uploadPictureToS3 } from "../utils/uploadPictureToS3";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import createError from "http-errors";

export async function uploadAuctionPicture(event) {
  const { id } = event.pathParameters;

  const auction = await findAuctionById(id);

  console.log(auction);

  const base64 = event.body.replace(/^data:image\/\w+;base64,/, "");
  const imageBuffer = Buffer.from(base64, "base64");

  try {
    const uploadResult = await uploadPictureToS3(
      `${auction.id}.jpg`,
      imageBuffer
    );
    console.log(uploadResult);
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "DONE!",
    }),
  };
}

export const handler = middy(uploadAuctionPicture).use(httpErrorHandler());
