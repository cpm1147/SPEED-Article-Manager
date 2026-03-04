'use client';

import { useEffect, useState, FormEvent } from 'react';
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
  isApproved: boolean;
}

export default function AnalysisDetailPage() {
  const router = useRouter();
  const params = useParams();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState<string[]>([]);
  const [source, setSource] = useState('');
  const [publicationYear, setPublicationYear] = useState<number | ''>('');
  const [doi, setDoi] = useState('');
  const [abstract, setAbstract] = useState('');
  const [linkedDiscussion, setLinkedDiscussion] = useState('');

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");

    if (!token || (role !== "ANALYST" && role !== "ADMIN")) {
      router.push("/");
      return;
    }
  }, [router]);

  useEffect(() => {
    async function fetchArticleForAnalysis() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/articles/${params.id}`
        );
        if (!res.ok) {
          throw new Error('Article not found');
        }
        const data: Article = await res.json();

        if (!(data.isModerated === true && data.isRejected === false && data.isApproved === false)) {
          throw new Error('Article not available for analysis');
        }

        setArticle(data);
        setTitle(data.title);
        setAuthors(data.authors);
        setSource(data.source);
        setPublicationYear(data.publication_year);
        setDoi(data.doi);
        setAbstract(data.abstract);
        setLinkedDiscussion(data.linked_discussion ?? '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch article');
      } finally {
        setLoading(false);
      }
    }
    fetchArticleForAnalysis();
  }, [params.id]);

  const addAuthor = () => setAuthors([...authors, '']);
  const removeAuthor = (index: number) =>
    setAuthors(authors.filter((_, i) => i !== index));
  const changeAuthor = (index: number, value: string) =>
    setAuthors(authors.map((a, i) => (i === index ? value : a)));

  const submitAnalysis = async (e: FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/articles/${params.id}/analyse`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            authors,
            source,
            publication_year: publicationYear,
            doi,
            abstract,
            linked_discussion: linkedDiscussion,
            isModerated: article?.isModerated ?? false,
            isRejected: article?.isRejected ?? false,
          }),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to update analysis');
      }

      const updatedArticle: Article = await res.json();
      setArticle(updatedArticle);
      alert('Article updated successfully!');
      router.push('/analyst');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!article) return <div>Article not found.</div>;

  return (
    <div className={formStyles.formWrapper}>
      <h1 style={{ fontSize: '2rem' }}>Analyse Article</h1>
      <form onSubmit={submitAnalysis} className={formStyles.form}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          className={formStyles.formItem}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Authors</label>
        {authors.map((author, idx) => (
          <div key={idx} className={formStyles.arrayItem}>
            <input
              type="text"
              className={formStyles.formItem}
              value={author}
              onChange={(e) => changeAuthor(idx, e.target.value)}
              required
            />
            <button
              type="button"
              className={formStyles.buttonItem}
              onClick={() => removeAuthor(idx)}
            >
              -
            </button>
          </div>
        ))}
        <button
          type="button"
          className={formStyles.buttonItem}
          onClick={addAuthor}
          style={{ marginLeft: 'auto' }}
        >
          +
        </button>

        <label htmlFor="source">Source</label>
        <input
          id="source"
          type="text"
          className={formStyles.formItem}
          value={source}
          onChange={(e) => setSource(e.target.value)}
          required
        />

        <label htmlFor="publicationYear">Publication Year</label>
        <input
          id="publicationYear"
          type="number"
          className={formStyles.formItem}
          value={publicationYear}
          onChange={(e) =>
            setPublicationYear(e.target.value === '' ? '' : parseInt(e.target.value))
          }
          required
        />

        <label htmlFor="doi">DOI</label>
        <input
          id="doi"
          type="text"
          className={formStyles.formItem}
          value={doi}
          onChange={(e) => setDoi(e.target.value)}
          required
        />

        <label htmlFor="abstract">Abstract</label>
        <textarea
          id="abstract"
          className={formStyles.formItem}
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          rows={5}
          required
        />

        <label htmlFor="linkedDiscussion">Linked Discussion</label>
        <textarea
          id="linkedDiscussion"
          className={formStyles.formItem}
          value={linkedDiscussion}
          onChange={(e) => setLinkedDiscussion(e.target.value)}
          rows={3}
        />

        <button
          type="submit"
          className={formStyles.buttonItem}
          disabled={saving}
          style={{ marginTop: '1rem' }}
        >
          {saving ? 'Saving...' : 'Submit Analysis'}
        </button>
      </form>

      <div className="mt-6">
        <Link href="/analyst" className={formStyles.buttonItem}>
          Back to Analysis List
        </Link>
      </div>
    </div>
  );
}
