import PortfolioClient from "./portfolio-client";

const GITHUB_USERNAME = "rays63";
const PROJECT_LIMIT = 6;

const extractReadmeSummary = (readmeText, fallback) => {
  if (!readmeText) return fallback;

  const lines = readmeText.split("\n").map((line) => line.trim());
  const cleanLines = lines.filter((line) => {
    if (!line) return false;
    if (line.startsWith("#")) return false;
    if (line.startsWith("![")) return false;
    if (line.startsWith("[") && line.includes("]:")) return false;
    if (line.startsWith("---")) return false;
    return true;
  });

  const summary = cleanLines.find((line) => /[a-zA-Z]/.test(line));
  if (!summary) return fallback;
  return summary.length > 160 ? `${summary.slice(0, 157)}...` : summary;
};

const fetchReadmeSummary = async (owner, repoName, fallback) => {
  try {
    const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/readme`, {
      headers: { Accept: "application/vnd.github.raw+json" }
    });

    if (!readmeResponse.ok) return fallback;
    const rawReadme = await readmeResponse.text();
    return extractReadmeSummary(rawReadme, fallback);
  } catch {
    return fallback;
  }
};

// Runs at build time so the project cards ship inside the static HTML,
// which is what search engines index reliably.
const loadGitHubProjects = async () => {
  if (!GITHUB_USERNAME || GITHUB_USERNAME === "your-github-username") {
    return { projects: [], projectsStatus: "Set your GitHub username in app/page.js to load projects here." };
  }

  try {
    const reposResponse = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100&type=owner`,
      { headers: { Accept: "application/vnd.github+json" } }
    );

    if (!reposResponse.ok) {
      return { projects: [], projectsStatus: "Unable to load GitHub projects right now." };
    }

    const repos = await reposResponse.json();
    const selectedRepos = repos.filter((repo) => !repo.fork).slice(0, PROJECT_LIMIT);

    if (!selectedRepos.length) {
      return { projects: [], projectsStatus: "No public repositories found for this user." };
    }

    const projects = await Promise.all(
      selectedRepos.map(async (repo) => {
        const fallback = repo.description || "No description provided yet.";
        const summary = await fetchReadmeSummary(repo.owner.login, repo.name, fallback);
        return {
          name: repo.name,
          summary,
          url: repo.html_url,
          language: repo.language || "Mixed stack"
        };
      })
    );

    return { projects, projectsStatus: "" };
  } catch {
    return { projects: [], projectsStatus: "Failed to load projects. Please try again later." };
  }
};

export default async function Page() {
  const { projects, projectsStatus } = await loadGitHubProjects();

  return <PortfolioClient projects={projects} projectsStatus={projectsStatus} />;
}
