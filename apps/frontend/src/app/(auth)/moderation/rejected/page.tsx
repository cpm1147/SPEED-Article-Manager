'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import formStyles from '@/styles/Form.module.scss';
import resultsStyles from '@/styles/Results.module.scss';

interface Article {
  _id: string;
  title: string;
  authors: string[];
  source: string;
  publication_year: number;
  doi: string;
  abstract: string; 
  linked_discussion?: string;
  isModerated: boolean;
  isRejected: boolean;
  createdAt: string;
}

export default function RejectedPage() {
  const router = useRouter();
  const [rejected, setRejected] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");

    if (!token || (role !== "MODERATOR" && role !== "ADMIN")) {
      router.push("/");
      return;
    }

    const fetchRejected = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/articles/rejected`
        );
        if (!res.ok) throw new Error('Failed to fetch rejected articles');
        const data: Article[] = await res.json();
        setRejected(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchRejected();
  }, [router]);

  if (loading) return <div>Loading rejected articles…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className={formStyles.formWrapper}>
      <h1 style={{ fontSize: '2rem' }}>Previously Rejected Articles</h1>
      {rejected.length === 0 ? (
        <p>No rejected articles.</p>
      ) : (
        <div className={resultsStyles.resultsTable}>
          {rejected.map((article) => (
            <div
              key={article._id}
              className="border p-4 mb-4 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-1">{article.title}</h2>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Author:</span>{' '}
                {article.authors.join(', ')}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Rejected At:</span>{' '}
                {new Date(article.createdAt).toLocaleString()}
              </div>
              <p className="text-red-600 mt-2">This article was rejected.</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-8">
        <button
          className="text-blue-600 underline"
          onClick={() => router.push('/moderation')}
        >
          Back to Pending
        </button>
      </div>
    </div>
  );
}
