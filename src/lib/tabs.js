/** Bottom-tab destinations. Their pages stay mounted once visited, so state survives tab switches. */
export const TAB_PATHS = ["/", "/journal", "/map", "/my-records"];

export const isTabPath = (pathname) => TAB_PATHS.includes(pathname);

/**
 * Each tab owns a group of routes: its root plus the pages opened from it. The last page
 * visited in a group is remembered, so returning to a tab resumes where you were.
 */
export const TAB_GROUPS = [
  { root: "/", prefixes: ["/", "/module", "/lesson", "/getting-started"] },
  { root: "/journal", prefixes: ["/journal"] },
  { root: "/map", prefixes: ["/map"] },
  { root: "/my-records", prefixes: ["/my-records", "/record"] },
];

export const isInPrefixes = (pathname, prefixes) =>
  prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

const groupFor = (pathname) => TAB_GROUPS.find((group) => isInPrefixes(pathname, group.prefixes));

const lastPathByRoot = {};

export const rememberTabPath = (pathname) => {
  const group = groupFor(pathname);
  if (group) lastPathByRoot[group.root] = pathname;
};

export const resumePath = (root) => lastPathByRoot[root] ?? root;
