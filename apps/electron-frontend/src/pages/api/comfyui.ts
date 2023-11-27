import { NextApiRequest, NextApiResponse } from "next";

export default async function proxyComfyUI(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const params = req.body;
    const path = params.path;
    res.send({
        success: true,
        message: "Hello world"
    })
}