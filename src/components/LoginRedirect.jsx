import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Where someone who is not logged in is sent when they reach for a part of the
 * workbook that needs an account. The page they asked for comes back after they
 * log in, so nothing they clicked is lost.
 */
export default function LoginRedirect() {
  const { pathname, search } = useLocation();
  const returnTo = encodeURIComponent(`${pathname}${search}`);
  return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
}