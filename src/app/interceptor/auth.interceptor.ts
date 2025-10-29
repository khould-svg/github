import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('_LAhomes_AUTH_SESSION_KEY_');
 

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: token 
      }
    });
  } 

  return next(req);
};
