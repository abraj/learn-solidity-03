import { useEffect } from 'react';
import { useZKDemo } from '@/hooks/zk-demo';

export default function ZKDemo({ visible }: ZKDemoProps) {
  const { message, loading, submitZKProof, resetMessage } = useZKDemo();

  useEffect(() => {
    if (typeof message !== 'undefined' && !visible) {
      resetMessage();
    }
  }, [visible, message, resetMessage]);

  return (
    <div className="flex border h-10 p-1 items-center">
      {visible && (
        <>
          <strong>Factors of 12:</strong>
          <div>&nbsp;</div>
          <form onSubmit={submitZKProof} className="flex">
            <input type="hidden" name="submitter" defaultValue="" />
            <input
              name="in1"
              type="number"
              className="w-10 border border-gray-300 rounded px-1"
            />
            <div>&nbsp;</div>
            <input
              name="in2"
              type="number"
              className="w-10 border border-gray-300 rounded px-1"
            />
            <div>&nbsp;</div>
            <button
              onClick={(e) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (e.target as any).parentElement.children[0].value = 'button1';
              }}
            >
              server
            </button>
            <div>&nbsp;</div>
            <button
              onClick={(e) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (e.target as any).parentElement.children[0].value = 'button2';
              }}
            >
              sepolia
            </button>
          </form>
          <div>&nbsp;&nbsp;</div>
          <div>
            {loading && <span>Please wait..</span>}
            {!loading &&
              message &&
              typeof message === 'string' &&
              (message.includes('OK') ? (
                <span className="text-green-600">{message}</span>
              ) : (
                <span className="text-red-600">{message}</span>
              ))}
          </div>
        </>
      )}
    </div>
  );
}

export interface ZKDemoProps {
  visible: boolean;
}
