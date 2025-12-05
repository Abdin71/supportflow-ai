import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Public routes that don't require authentication
const publicRoutes = ["/login"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // TODO: Integrate with Firebase Auth
  // When Firebase is connected, check for valid session token:
  //
  // import { getAuth } from 'firebase-admin/auth'
  // const token = request.cookies.get('session')?.value
  //
  // try {
  //   await getAuth().verifySessionCookie(token || '', true)
  //   return NextResponse.next()
  // } catch (error) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  // For now, check localStorage on client side via ProtectedRoute component
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
