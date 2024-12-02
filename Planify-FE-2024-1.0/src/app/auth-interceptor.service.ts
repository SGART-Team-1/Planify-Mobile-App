import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export function authInterceptor(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  // Skip adding Authorization for specific routes
  console.log(req.url);
  if (req.url.startsWith('/users')) {
    return next(req); // Simply pass the request without modification
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    // Add Authorization header to other requests
    const authToken = 'Bearer ' + window.localStorage.getItem('user');

    // Clone the request and set the Authorization header
    const authReq = req.clone({
      setHeaders: { Authorization: authToken }
    });
    return next(authReq);
    }
  return next(req);
}