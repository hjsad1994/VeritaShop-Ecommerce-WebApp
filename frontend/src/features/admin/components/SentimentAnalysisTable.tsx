import React, { useEffect, useState } from 'react';
import variantService from '@/lib/api/variantService';
import { ProductVariantSentiment } from '@/lib/api/types';

interface SentimentAnalysisTableProps {
  productId: string;
  variantId: string;
}

export const SentimentAnalysisTable: React.FC<SentimentAnalysisTableProps> = ({ productId, variantId }) => {
  const [sentiment, setSentiment] = useState<ProductVariantSentiment | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSentiment = async () => {
      setLoading(true);
      try {
        const data = await variantService.getSentiment(productId, variantId);
        setSentiment(data);
      } catch (error) {
        console.error('Failed to fetch sentiment', error);
      } finally {
        setLoading(false);
      }
    };

    if (variantId && productId) {
      fetchSentiment();
    }
  }, [productId, variantId]);

  if (loading) {
    return <div className="p-4">Loading sentiment data...</div>;
  }

  if (!sentiment) {
    return <div className="p-4 text-gray-500">No sentiment data available for this variant.</div>;
  }

  const aspects = [
    { key: 'battery', label: 'Battery' },
    { key: 'camera', label: 'Camera' },
    { key: 'performance', label: 'Performance' },
    { key: 'display', label: 'Display' },
    { key: 'design', label: 'Design' },
    { key: 'packaging', label: 'Packaging' },
    { key: 'price', label: 'Price' },
    { key: 'shopService', label: 'Shop Service' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'general', label: 'General' },
    { key: 'others', label: 'Others' },
  ] as const;

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Sentiment Analysis</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aspect</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interpretation</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {aspects.map((aspect) => {
              const score = sentiment[aspect.key];
              let color = 'text-gray-900';
              let text = 'Neutral';
              
              if (score > 0.2) {
                color = 'text-green-600';
                text = 'Positive';
              } else if (score < -0.2) {
                color = 'text-red-600';
                text = 'Negative';
              }

              return (
                <tr key={aspect.key}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{aspect.label}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{score.toFixed(2)}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${color}`}>{text}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
