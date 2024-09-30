import { FormEvent, useCallback, useState } from 'react';
// import { zkDemoAction } from '@/api/zk/zk-demo';

async function zkDemoRequest(inputData: InputData) {
  if (!inputData) return;
  try {
    const resp = await fetch('http://localhost:3001/zk-demo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputData),
    });
    const respData = await resp.json();
    return respData;
  } catch (err) {
    console.error(err);
  }
}

export function useZKDemo() {
  const [message, setMessage] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const submitZKProofOnServer = useCallback(async (inputData: InputData) => {
    setLoading(true);
    // await zkDemoAction(inputData);
    const respData = await zkDemoRequest(inputData);
    setLoading(false);

    let msg = '';
    if (!respData) {
      msg = 'Unable to perform server request!';
    } else {
      const { status, data, errMsg } = respData;
      if (status === 'ok' && data.verified === true) {
        msg = 'ZK Verification OK';
      } else {
        msg = errMsg ?? '';
      }
    }

    if (msg) setMessage(msg);
  }, []);

  const submitZKProof = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const form = e.target as HTMLFormElement;

      const submitter = (
        form.elements.namedItem('submitter') as HTMLInputElement
      ).value;
      const in1 = (form.elements.namedItem('in1') as HTMLInputElement).value;
      const in2 = (form.elements.namedItem('in2') as HTMLInputElement).value;

      if (!in1 || !in2) {
        console.error(`[ERROR] Invalid input: ${in1}, ${in2}`);
        return;
      }
      const inputData = { in1, in2 };

      if (submitter === 'button1') {
        await submitZKProofOnServer(inputData);
      } else if (submitter === 'button2') {
        // await submitZKProofOnSepolia(inputData);
      } else {
        console.error('Invalid submitter!');
      }
    },
    [submitZKProofOnServer]
  );

  const resetMessage = useCallback(() => {
    setMessage(undefined);
  }, []);

  return { message, loading, submitZKProof, resetMessage };
}

interface InputData {
  in1: string;
  in2: string;
}
