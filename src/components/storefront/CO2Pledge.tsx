import { Leaf } from 'lucide-react';

interface CO2PledgeProps {
  amount: number;
  locale: string;
  currency: string;
  storeName: string;
}

export function CO2Pledge({ amount, locale, currency, storeName }: CO2PledgeProps) {
  const pledgeAmount = amount * 0.005; // 0.5% of purchase amount
  
  return (
    <div className="flex items-start gap-2 text-sm text-gray-600 bg-green-50 p-3 rounded-md">
      <Leaf className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      <p>
        {storeName} vil bidrage med{' '}
        {new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency
        }).format(pledgeAmount)}{' '}
        af dit køb for at hjælpe med at fjerne CO₂ fra atmosfæren.
      </p>
    </div>
  );
}
