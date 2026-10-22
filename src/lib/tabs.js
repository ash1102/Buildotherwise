/** Bottom-tab destinations. Their pages stay mounted once visited, so state survives tab switches. */
export const TAB_PATHS = ["/", "/journal", "/map", "/my-records"];

export const isTabPath = (pathname) => TAB_PATHS.includes(pathname);
