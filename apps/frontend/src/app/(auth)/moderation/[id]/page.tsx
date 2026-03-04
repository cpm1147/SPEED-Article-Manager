'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import formStyles from '@/styles/Form.module.scss';
import Link from 'next/link';

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

export default function ModerationDetailPage() {
  const router = useRouter();
  const params = useParams(); 
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");

    if (!token || (role !== "MODERATOR" && role !== "ADMIN")) {
      router.push("/");
      return;
    }
  }, [router]);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/articles/${params.id}`
        );
        if (!res.ok) {
          throw new Error('Article not found');
        }
        const data: Article = await res.json();

        if (data.isModerated || data.isRejected) {
          throw new Error('Article not available');
        }

        setArticle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params.id]);

  if (loading) return <div>Loading…</div>;
  if (error)   return <div className="text-red-600">Error: {error}</div>;

  if (!article) return <div>Article not found or not pending.</div>;

  return (
    <div className={formStyles.formWrapper}>
      <h1 style={{ fontSize: '2rem' }}>{article.title}</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Authors</h2>
        <p>{article.authors.join(', ')}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h2 className="font-semibold">Publication Year</h2>
          <p>{article.publication_year}</p>
        </div>
        <div>
          <h2 className="font-semibold">Source</h2>
          <p>{article.source}</p>
        </div>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold">DOI</h2>
        <p>{article.doi}</p>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold">Abstract</h2>
        <p>{article.abstract}</p>   {}
      </div>
      {article.linked_discussion && (
        <div className="mb-4">
          <h2 className="font-semibold">Linked Discussion</h2>
          <p>{article.linked_discussion}</p>
        </div>
      )}
      <div className="mt-6">
        <Link href="/moderation" className={formStyles.buttonItem}>
          Back to Pending
        </Link>
      </div>
    </div>
  );
}
