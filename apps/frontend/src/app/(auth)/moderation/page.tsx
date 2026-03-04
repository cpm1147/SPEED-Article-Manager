/* eslint-disable @typescript-eslint/no-unused-vars */
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

export default function ModerationListPage() {
  const router = useRouter();
  const [pending, setPending] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [duplicates, setDuplicates] = useState<
    Record<string, { titleDuplicate: boolean; doiDuplicate: boolean }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");

    if (!token || (role !== "MODERATOR" && role !== "ADMIN")) {
      router.push("/");
      return;
    }

    const fetchPendingAndAll = async () => {
      try {
        const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
        const resPend = await fetch(`${BASE}/api/articles/unmoderated`);
        if (!resPend.ok) {
          throw new Error("Failed to fetch pending articles");
        }
        const pendData: Article[] = await resPend.json();
        setPending(pendData);

        const resAll = await fetch(`${BASE}/api/articles?all=true`);
        if (!resAll.ok) {
          throw new Error("Failed to fetch all articles");
        }
        const allData: Article[] = await resAll.json();
        setAllArticles(allData);

        const dupMap: Record<
          string,
          { titleDuplicate: boolean; doiDuplicate: boolean }
        > = {};
        pendData.forEach((pend) => {
          const titleDup = allData.some(
            (a) =>
              a._id !== pend._id &&
              a.title.trim().toLowerCase() === pend.title.trim().toLowerCase()
          );
          const doiDup = allData.some(
            (a) =>
              a._id !== pend._id &&
              a.doi.trim().toLowerCase() === pend.doi.trim().toLowerCase()
          );
          dupMap[pend._id] = { titleDuplicate: titleDup, doiDuplicate: doiDup };
        });
        setDuplicates(dupMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingAndAll();
  }, [router]);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/articles/${id}/moderate`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Status ${res.status}: ${text}`);
      }
      setPending((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error while approving");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/articles/${id}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Status ${res.status}: ${text}`);
      }
      setPending((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error while rejecting");
    }
  };

  if (loading) return <div>Loading pending articles…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="container">
      <div className={formStyles.formWrapper}>
        <h1 style={{ fontSize: "2rem" }}>Pending Articles</h1>

        {pending.length === 0 ? (
          <p>No pending articles.</p>
        ) : (
          <div className={resultsStyles.resultsTable}>
            {pending.map((article) => {
              const dup = duplicates[article._id] || {
                titleDuplicate: false,
                doiDuplicate: false,
              };
              return (
                <div
                  key={article._id}
                  className="border p-4 mb-4 hover:shadow-lg transition-shadow"
                >
                  <Link href={`/moderation/${article._id}`}>
                    <h2 className="text-xl font-semibold mb-2">
                      {article.title}
                    </h2>
                  </Link>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Author:</span>{" "}
                    {article.authors.join(", ")}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Submitted At:</span>{" "}
                    {new Date(article.createdAt).toLocaleString()}
                  </div>
                  {dup.titleDuplicate && (
                    <p className="text-red-600 mb-1">
                      Duplicate title detected
                    </p>
                  )}
                  {dup.doiDuplicate && (
                    <p className="text-red-600 mb-1">Duplicate DOI detected</p>
                  )}
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleApprove(article._id)}
                      className={`${formStyles.buttonItem} approveButton`}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(article._id)}
                      className={`${formStyles.buttonItem} rejectButton`}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <Link href="/moderation/rejected">
          <button className={formStyles.buttonItem}>
            View Rejected Articles
          </button>
        </Link>
      </div>
    </div>
  );
}
