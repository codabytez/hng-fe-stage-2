import { NextResponse, type NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth-server";

const publicRoutes = ["/sign-in", "/sign-up"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let authenticated = false;
  try {
    authenticated = await isAuthenticated();
  } catch {
    authenticated = false;
  }

  if (!authenticated && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (authenticated && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
