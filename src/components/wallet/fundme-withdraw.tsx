import { useWithdrawFundMe } from '@/hooks/chain';

export default function WithdrawFundMe({ visible }: WithdrawFundMeProps) {
  const { response, loading, withdrawFundMe } = useWithdrawFundMe();
  const { status, message } = response ?? {};

  return (
    <div className="flex border h-10 p-1 items-center">
      {visible && (
        <>
          <div>
            <button
              className="text-yellow-600"
              onClick={() => withdrawFundMe()}
            >
              Sepolia:withdraw
            </button>
          </div>
          <div>&nbsp;&nbsp;</div>
          <div>
            {loading && <span>Please wait..</span>}
            {!loading && status === 'ok' && (
              <span className="text-green-600">{message}</span>
            )}
            {!loading && status === 'error' && (
              <span className="text-red-600">{message}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface WithdrawFundMeProps {
  visible: boolean;
}
