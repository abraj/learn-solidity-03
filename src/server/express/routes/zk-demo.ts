import { Request, Response } from 'express';
import { serverZKProof } from '../../zk-proof/zk-proof.js';

export const zkDemoHandler = async (req: Request, res: Response) => {
  let status = 'ok';
  let verified = false;
  let errMsg = '';

  try {
    const inputData = req.body;
    verified = await serverZKProof(inputData);
  } catch (err) {
    console.error(err);
    status = 'error';
    errMsg = (err as Error).message;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = { status, data: { verified } } as any;
  if (errMsg) response.errMsg = errMsg;

  res.json(response);
};
