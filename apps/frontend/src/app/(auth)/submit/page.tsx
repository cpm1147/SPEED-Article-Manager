"use client";

import { FormEvent, useEffect, useState } from "react";
import formStyles from "@/styles/Form.module.scss";
import { useRouter } from "next/navigation";

const NewDiscussion = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState<string[]>([]);
  const [source, setSource] = useState("");
  const [pubYear, setPubYear] = useState<number | "">("");
  const [doi, setDoi] = useState("");
  const [abstractText, setAbstractText] = useState("");
  const [linkedDiscussion, setLinkedDiscussion] = useState("");
  const [practice, setPractice] = useState("");
  const [claim, setClaim] = useState("");
  const [result, setResult] = useState("");
  const [participantType, setParticipantType] = useState("");
  const [method, setMethod] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [bibtexInput, setBibtexInput] = useState(""); // New state for BibTeX input
  const [parsingError, setParsingError] = useState<string | null>(null); // New state for parsing errors

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      router.push("/");
    }
  }, [router]);

  function parseBibtex() {
    const bibtex = bibtexInput;
    // Helper function to extract field values
    const extractField = (field: string, content: string) => {
      const regex = new RegExp(
        `${field}\\s*=\\s*({[^{}]*}|".*?"|[^,\\n]*)`,
        "i"
      );
      const match = content.match(regex);
      if (!match) return undefined;

      let value = match[1].trim();

      // Remove wrapping braces or quotes if present
      if (
        (value.startsWith("{") && value.endsWith("}")) ||
        (value.startsWith('"') && value.endsWith('"'))
      ) {
        value = value.slice(1, -1);
      }

      return value.trim();
    };

    // Remove comments and normalize whitespace
    const cleanedBibtex = bibtex
      .replace(/%.*?\n/g, "") // Remove comments
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    // Extract entry type and content
    const entryTypeMatch = cleanedBibtex.match(/@(\w+)\s*\{/i);
    if (!entryTypeMatch) {
      throw new Error("Invalid BibTeX format: Could not find entry type");
    }

    const contentStart = entryTypeMatch.index! + entryTypeMatch[0].length;
    const contentEnd = cleanedBibtex.lastIndexOf("}");
    const content = cleanedBibtex.slice(contentStart, contentEnd).trim();

    // Extract fields
    const bibTitle = extractField("title", content);
    const bibAuthor = extractField("author", content);
    const bibYear = extractField("year", content);
    const bibPublisher = extractField("publisher", content);
    const bibAbstract = extractField("abstract", content);
    const bibDoi =
      extractField("doi", content) || extractField("isbn", content); // Fallback to ISBN if no DOI

    // Process authors
    let bibAuthors: string[] = [];
    if (bibAuthor) {
      bibAuthors = bibAuthor
        .split(/\s+and\s+/i)
        .map((author) => {
          // Handle "Last, First" and "First Last" formats
          const parts = author.split(",").map((part) => part.trim());
          return parts.length > 1 ? `${parts[1]} ${parts[0]}` : parts[0];
        })
        .filter((author) => author.trim() !== "");
    }

    if (bibTitle) {
      console.log(bibTitle);
      setTitle(bibTitle);
    } else {
      setParsingError("Failed to parse BibTex title");
    }

    if (bibAuthors) {
      console.log(bibAuthors);
      setAuthors(bibAuthors);
    } else {
      setParsingError("Failed to parse BibTex authors");
    }

    if (bibPublisher) {
      console.log(bibPublisher);
      setSource(bibPublisher);
    } else {
      setParsingError("Failed to parse BibTex source");
    }

    if (bibYear) {
      console.log(bibYear);
      setPubYear(Number(bibYear));
    } else {
      setParsingError("Failed to parse BibTex publication year");
    }

    if (bibDoi) {
      console.log(bibDoi);
      setDoi(bibDoi);
    } else {
      setParsingError("Failed to parse BibTex DOI");
    }

    if (bibAbstract) {
      console.log(bibAbstract);
      setAbstractText(bibAbstract);
    } else {
      setParsingError("Failed to parse BibTex abstract");
    }
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (authors.length === 0 || authors.some((a) => a.trim() === ""))
      newErrors.authors = "At least one author is required";
    if (!pubYear || isNaN(Number(pubYear)))
      newErrors.pubYear = "Valid publication year is required";
    if (!doi.trim()) newErrors.doi = "DOI is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitNewArticle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/articles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            authors,
            source,
            publication_year: pubYear,
            doi,
            abstract: abstractText,
            linked_discussion: linkedDiscussion,
            practice,
            claim,
            result,
            participant_type: participantType,
            method,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to submit article: ${response.statusText}`);
      }

      alert("Article submitted successfully!");
      setBibtexInput("");
      setTitle("");
      setAuthors([]);
      setSource("");
      setPubYear("");
      setDoi("");
      setAbstractText("");
      setLinkedDiscussion("");
      setErrors({});
    } catch (error) {
      alert(error);
      console.error("Submit error:", error);
    }
  };

  const addAuthor = () => {
    setAuthors(authors.concat([""]));
  };

  const removeAuthor = (index: number) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const changeAuthor = (index: number, value: string) => {
    setAuthors(authors.map((oldVal, i) => (i === index ? value : oldVal)));
  };

  return (
    <div className={formStyles.formWrapper}>
      <h1 style={{ fontSize: "2rem" }}>New Article</h1>
      <form className={formStyles.form} onSubmit={submitNewArticle}>
        {/* BibTeX Input */}
        <label htmlFor="bibtexInput">Paste BibTeX Entry Here (Optional):</label>
        <textarea
          className={formStyles.formTextArea}
          id="bibtexInput"
          value={bibtexInput}
          onChange={(e) => setBibtexInput(e.target.value)}
          placeholder="@article{yourcitekey, ...}"
          rows={8}
        />
        <button
          type="button"
          onClick={parseBibtex}
          className={formStyles.buttonItem}
          style={{ marginBottom: "1rem" }}
        >
          Parse BibTeX
        </button>
        {parsingError && <p className={formStyles.error}>{parsingError}</p>}
        <hr style={{ margin: "1.5rem 0" }} /> {/* Separator */}
        <h2>Or fill out manually:</h2>
        <label htmlFor="title">Title:</label>
        <input
          className={formStyles.formItem}
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && <p className={formStyles.error}>{errors.title}</p>}
        <label>Authors:</label>
        {authors.map((author, index) => (
          <div key={index} className={formStyles.arrayItem}>
            <input
              type="text"
              value={author}
              onChange={(e) => changeAuthor(index, e.target.value)}
              className={formStyles.formItem}
            />
            <button
              onClick={() => removeAuthor(index)}
              className={formStyles.buttonItem}
              type="button"
            >
              -
            </button>
          </div>
        ))}
        <div className={formStyles.leftAligned}>
          <button
            onClick={addAuthor}
            className={formStyles.buttonItem}
            type="button"
          >
            +
          </button>
        </div>
        {errors.authors && <p className={formStyles.error}>{errors.authors}</p>}
        <label htmlFor="source">Source:</label>
        <input
          className={formStyles.formItem}
          type="text"
          id="source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        <label htmlFor="pubYear">Publication Year:</label>
        <input
          className={formStyles.formItem}
          type="number"
          id="pubYear"
          value={pubYear}
          onChange={(e) =>
            setPubYear(e.target.value === "" ? "" : parseInt(e.target.value))
          }
        />
        {errors.pubYear && <p className={formStyles.error}>{errors.pubYear}</p>}
        <label htmlFor="doi">DOI:</label>
        <input
          className={formStyles.formItem}
          type="text"
          id="doi"
          value={doi}
          onChange={(e) => setDoi(e.target.value)}
        />
        {errors.doi && <p className={formStyles.error}>{errors.doi}</p>}
        <label htmlFor="abstract">Abstract:</label>
        <textarea
          className={formStyles.formTextArea}
          name="abstract"
          value={abstractText}
          onChange={(e) => setAbstractText(e.target.value)}
        />
        <label htmlFor="practice">Practice:</label>
        <input
          className={formStyles.formItem}
          type="text"
          id="practice"
          value={practice}
          onChange={(e) => setPractice(e.target.value)}
        />
        <label htmlFor="claim">Claim:</label>
        <input
          className={formStyles.formItem}
          type="text"
          id="claim"
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
        />
        <label htmlFor="result">Result:</label>
        <input
          className={formStyles.formItem}
          type="text"
          id="result"
          value={result}
          onChange={(e) => setResult(e.target.value)}
        />
        <label htmlFor="participantType">Participant Type:</label>
        <input
          className={formStyles.formItem}
          type="text"
          id="participantType"
          value={participantType}
          onChange={(e) => setParticipantType(e.target.value)}
        />
        <label htmlFor="method">Method:</label>
        <input
          className={formStyles.formItem}
          type="text"
          id="method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        />
        <button className={formStyles.formButton} type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default NewDiscussion;
