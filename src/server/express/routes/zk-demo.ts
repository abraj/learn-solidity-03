import { Request, Response } from 'express';
import { serverZKProof } from '@/server/zk-proof/zk-proof';

export const zkDemoHandler = async (req: Request, res: Response) => {
  let status: 'ok' | 'error' = 'ok';
  let verified = false;
  let errMsg = '';

  try {
    const { inputData, verifyOnChain } = req.body;
    verified = await serverZKProof(inputData, verifyOnChain);
  } catch (err) {
    console.error(err);
    status = 'error';
    errMsg = (err as Error).message;
  }

  const response: ResponseType = { status };
  if (status === 'ok') {
    response.data = { verified };
  } else {
    response.errMsg = errMsg;
  }

  res.json(response);
};

interface ResponseType {
  status: 'ok' | 'error';
  data?: { verified: boolean };
  errMsg?: string;
}
