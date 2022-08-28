import { getEndedAuction } from "../utils/getEndedAuction";
import { closeAuction } from "../utils/closeAuction";
import createError from "http-errors";

async function processAuction(event, context) {
  try {
    const auctions = await getEndedAuction();
    if (auctions.length !== 0) {
      const closedAuctions = auctions.map((auction) => closeAuction(auction));

      await Promise.all(closedAuctions);

      return { closed: closedAuctions.length };
    }
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = processAuction;
