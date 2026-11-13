// Bylines. The owner chose a generic team byline (decision D6 in docs/BLOG_AUDIT_AND_PLAN.md):
// no named person, no invented biography or credentials.

export interface BlogAuthor {
  id: string;
  name: string;
  /** Short, true description of who writes and checks the content. */
  bio: string;
  /** Page that explains how this author works. */
  profilePath: string;
}

export const BLOG_AUTHORS: BlogAuthor[] = [
  {
    id: "editorial-team",
    name: "Toolkit4Me Editorial Team",
    bio: "The team that builds and maintains Toolkit4Me's tools. Articles are checked against how the tools actually work before they are published, and updated when a tool changes.",
    profilePath: "/editorial-policy",
  },
];

export function getBlogAuthor(id: string): BlogAuthor {
  const author = BLOG_AUTHORS.find((a) => a.id === id);
  if (!author) throw new Error(`Unknown blog author "${id}"`);
  return author;
}
