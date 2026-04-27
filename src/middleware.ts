import { auth } from "@/lib/auth/config";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const protectedPrefixes = [
    "/dashboard",
    "/semester",
    "/unit",
    "/quiz",
    "/bookmarks",
    "/history",
    "/announcements",
    "/profile",
  ];
  const isStudentRoute = protectedPrefixes.some((p) => nextUrl.pathname.startsWith(p));
  const isAuthPage =
    nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup");

  if (isAdminRoute) {
    if (!isLoggedIn) {
      const url = new URL("/login", nextUrl);
      url.searchParams.set("callbackUrl", nextUrl.pathname);
      return Response.redirect(url);
    }
    if (role !== "admin") {
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
    return;
  }

  if (isStudentRoute && !isLoggedIn) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("callbackUrl", nextUrl.pathname);
    return Response.redirect(url);
  }

  if (isAuthPage && isLoggedIn) {
    const dest = role === "admin" ? "/admin" : "/dashboard";
    return Response.redirect(new URL(dest, nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png|logo-transparent.png|manifest.json|sw.js|icon-192.png|icon-512.png|apple-touch-icon.png|pdfs/.*).*)"],
};
