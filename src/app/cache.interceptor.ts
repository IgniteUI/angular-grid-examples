import { HttpInterceptorFn } from "@angular/common/http";
import { EMPTY } from "rxjs";
import { inject, PLATFORM_ID } from "@angular/core";
import { isPlatformServer } from "@angular/common";

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  req = req.clone({
    headers: req.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate'),
  });

  return next(req)
}
/**
 * This was added because in Angular 22, the HTTP client will make a request when
 * prerendering the application with a limitation of 1 MB for the response size.
 * Since the grid is not rendering any data when prerendering there is no point
 * in making the HTTP request on the server. This interceptor will skip the
 * request on the server and return an empty observable instead.
 * This will prevent the server from making unnecessary HTTP requests and improve
 * the build time without affecting the client-side behavior of the application.
 */
export const skipOnServerInterceptor: HttpInterceptorFn = (req, next) =>
  isPlatformServer(inject(PLATFORM_ID)) ? EMPTY : next(req);
