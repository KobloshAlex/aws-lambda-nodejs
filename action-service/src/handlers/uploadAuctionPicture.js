export async function uploadAuctionPicture(event) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      hello: 123
    })
  };
}

export const handler = uploadAuctionPicture;
