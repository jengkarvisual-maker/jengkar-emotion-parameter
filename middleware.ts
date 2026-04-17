import { type NextRequest, NextResponse } from "next/server";

import { APP_DOMAIN, APP_PORTAL_DOMAIN } from "@/lib/constants";

function normalizeHost(value: string | null) {
  if (!value) {
    return "";
  }

  return value.split(",")[0]?.trim().replace(/:\d+$/, "") ?? "";
}

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  );
}

export function middleware(request: NextRequest) {
  const host = normalizeHost(
    request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
  );
  const portalHost = new URL(APP_PORTAL_DOMAIN).host;

  if (host !== portalHost && host !== `www.${portalHost}`) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname === "/" || isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.protocol = "https";
  redirectUrl.host = new URL(APP_DOMAIN).host;

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
