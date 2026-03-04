"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import headerStyles from "@/styles/Header.module.scss";

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null); // state to store role

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  const logout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("first_name");
    localStorage.removeItem("last_name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("access_token");

    router.push("./");
  };

  const currentPage = pathname?.split("/")[1] || "search";

  return (
    <div className={headerStyles.header}>
      SPEED
      <ul className={headerStyles.navList}>
        <li className={currentPage === "articles" ? headerStyles.current : ""}>
          <a onClick={() => router.push("/articles")}>All Articles</a>
        </li>
        <li className={currentPage === "search" ? headerStyles.current : ""}>
          <a onClick={() => router.push("/search")}>Search</a>
        </li>
        <li className={currentPage === "submit" ? headerStyles.current : ""}>
          <a onClick={() => router.push("/submit")}>Submit</a>
        </li>
        {role === "ADMIN" ? (
          <li className={currentPage === "admin" ? headerStyles.current : ""}>
            <a onClick={() => router.push("/admin")}>Admin</a>
          </li>
        ) : null}
        {role === "MODERATOR" || role === "ADMIN" ? (
          <li
            className={currentPage === "moderation" ? headerStyles.current : ""}
          >
            <a onClick={() => router.push("/moderation")}>Moderate</a>
          </li>
        ) : null}
        {role === "ANALYST" || role === "ADMIN" ? (
          <li
            className={currentPage === "analyst" ? headerStyles.current : ""}
          >
            <a onClick={() => router.push("/analyst")}>Analyst</a>
          </li>
        ) : null}
      </ul>
      <div className={headerStyles.userInfo}>
        <p className={headerStyles.role}>User type: {role ?? "Loading..."}</p>
        <button
          className={headerStyles.logoutButton}
          type="button"
          onClick={logout}
        >
          LOGOUT
        </button>
      </div>
    </div>
  );
};

export default Header;
