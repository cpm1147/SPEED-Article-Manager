"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import formStyles from "@/styles/Form.module.scss";
import resultsStyles from "@/styles/Results.module.scss";

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

export default function ApprovedArticlesPage() {
  const router = useRouter();
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");

    if (!token || (role !== "ANALYST" && role !== "ADMIN")) {
      router.push("/");
      return;
    }

    const fetchAwaitingAnalysis = async () => {
      try {
        const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
        const res = await fetch(`${BASE}/api/articles/awaiting-analysis`);
        if (!res.ok)
          throw new Error("Failed to fetch awaiting analysis articles");

        const data: Article[] = await res.json();
        setAllArticles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchAwaitingAnalysis();
  }, [router]);

  if (loading) return <div>Loading articles…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="container">
      <div className={formStyles.formWrapper}>
        <h1 style={{ fontSize: "2rem" }}>Articles Awaiting Analysis</h1>

        {allArticles.length === 0 ? (
          <p>No articles are currently awaiting analysis.</p>
        ) : (
          <div className={resultsStyles.resultsTable}>
            {allArticles.map((article) => (
              <div
                key={article._id}
                className="border p-4 mb-4 hover:shadow-lg transition-shadow"
              >
                <Link href={`/analysis/${article._id}`}>
                  <h2 className="text-xl font-semibold mb-2">
                    {article.title}
                  </h2>
                </Link>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Author:</span>{" "}
                  {article.authors.join(", ")}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Published:</span>{" "}
                  {article.publication_year}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Source:</span> {article.source}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
