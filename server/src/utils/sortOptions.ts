// Pure helper that turns a "sort" query-string value into a SQL ORDER BY clause.
// Pulled out of routes/jokes.ts so it can be unit-tested without spinning up a database.

export function getSortClause(sort?: string): string {
  if (sort === "groan") {
    return "groan_level DESC";
  }
  if (sort === "oldest") {
    return "created_at ASC";
  }
  if (sort === "controversial") {
    // "Controversial" should mean "closest to a 50/50 split", not "smallest raw
    // difference". ABS(upvotes - downvotes) ASC was wrong: a joke with 0 upvotes
    // and 0 downvotes has the same ABS(diff) == 0 as a joke with 50 up / 50 down,
    // so untouched jokes and truly contested jokes tied for "most controversial".
    //
    // Instead, score by how close the vote split is to even, as a fraction of
    // total votes cast: MIN(upvotes, downvotes) / GREATEST(upvotes + downvotes, 1).
    // A perfect 50/50 split scores 0.5 (max). An untouched joke (0/0) scores 0
    // (min) because GREATEST(...,1) keeps the denominator from being 0/0 = NaN.
    // A lopsided 99/1 joke scores low too, since it's not actually contested.
    return "(LEAST(upvotes, downvotes)::float / GREATEST(upvotes + downvotes, 1)) DESC";
  }
  // Default: most popular first (net score = upvotes minus downvotes).
  return "upvotes - downvotes DESC";
}
