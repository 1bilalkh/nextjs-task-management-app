
"use client";

import { useState, FormEvent } from "react";
import "./github.css";

type GithubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  location: string | null;
  followers: number;
  following: number;
  public_repos: number;
};

type GithubRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
};

export default function GithubPage() {
  const [username, setUsername] = useState("octocat");
  const [profile, setProfile] = useState<GithubUser | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // GET: Fetch GitHub user profile and repositories
  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const searchUsername = username.trim();

    if (!searchUsername) {
      setError("Please enter a GitHub username");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setProfile(null);
      setRepos([]);

      const [userResponse, reposResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${encodeURIComponent(searchUsername)}`, {
          headers: {
            Accept: "application/vnd.github+json",
          },
        }),

        fetch(
          `https://api.github.com/users/${encodeURIComponent(searchUsername)}/repos?sort=updated&per_page=6`,
          {
            headers: {
              Accept: "application/vnd.github+json",
            },
          }
        ),
      ]);

      const userData = await userResponse.json();
      const reposData = await reposResponse.json();

      if (!userResponse.ok) {
        throw new Error(
          userData.message || "GitHub user not found"
        );
      }

      if (!reposResponse.ok) {
        throw new Error(
          reposData.message || "Failed to fetch repositories"
        );
      }

      setProfile(userData);
      setRepos(reposData);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="github-container">
      <div className="github-header">
        <h1>GitHub Profile Finder</h1>
        <p>
          Search any public GitHub profile and explore repositories.
        </p>
      </div>

      <form className="github-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter GitHub username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search Profile"}
        </button>
      </form>

      {error && (
        <p className="github-error">{error}</p>
      )}

      {loading && (
        <p className="github-loading">Loading GitHub profile...</p>
      )}

      {profile && !loading && (
        <>
          <section className="github-profile">
            <img
              src={profile.avatar_url}
              alt={`${profile.login} profile`}
              className="github-avatar"
            />

            <div className="github-info">
              <h2>{profile.name || profile.login}</h2>

              <p className="github-username">
                @{profile.login}
              </p>

              <p>
                {profile.bio || "No bio available"}
              </p>

              {profile.location && (
                <p>📍 {profile.location}</p>
              )}

              <a
                href={profile.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View GitHub Profile →
              </a>
            </div>
          </section>

          <section className="github-stats">
            <div>
              <h3>{profile.followers}</h3>
              <p>Followers</p>
            </div>

            <div>
              <h3>{profile.following}</h3>
              <p>Following</p>
            </div>

            <div>
              <h3>{profile.public_repos}</h3>
              <p>Public Repositories</p>
            </div>
          </section>

          <section className="github-repositories">
            <h2>Latest Public Repositories</h2>

            {repos.length === 0 ? (
              <p>No public repositories found.</p>
            ) : (
              <div className="github-repo-grid">
                {repos.map((repo) => (
                  <article
                    className="github-repo-card"
                    key={repo.id}
                  >
                    <h3>{repo.name}</h3>

                    <p>
                      {repo.description ||
                        "No description available"}
                    </p>

                    <div className="github-repo-stats">
                      <span>
                        {repo.language || "Unknown"}
                      </span>

                      <span>⭐ {repo.stargazers_count}</span>

                      <span>🍴 {repo.forks_count}</span>
                    </div>

                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Repository →
                    </a>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
