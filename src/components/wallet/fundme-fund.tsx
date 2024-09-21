import { useFundFundMe } from '@/hooks/chain';

export default function FundFundMe({ visible }: FundMeProps) {
  const { response, loading, fundFundMe } = useFundFundMe();
  const { status, message } = response ?? {};

  return (
    <div className="flex border h-10 p-1 items-center">
      {visible && (
        <>
          <form className="flex" onSubmit={fundFundMe}>
            <button className="text-yellow-600" type="submit">
              Sepolia:fund
            </button>
            <div>&nbsp;</div>
            <input
              name="amount"
              type="number"
              step="0.0001"
              className="w-16 border border-gray-300 rounded px-1"
            />
          </form>
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

interface FundMeProps {
  visible: boolean;
}
