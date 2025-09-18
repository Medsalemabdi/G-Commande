// src/app/core/auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';

const isApiCall = (url: string) => {
  // attach for either relative /api/* or absolute http(s)://.../api/*
  return url.startsWith('/api') || url.includes('/api/');
};

const isAuthEndpoint = (url: string) =>
  /\/api\/auth\/(login|refresh)/.test(url);

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // don’t touch non-API calls, or auth calls
  if (!isApiCall(req.url) || isAuthEndpoint(req.url)) {
    return next(req);
  }

  const token = localStorage.getItem('jwtToken');
  if (!token) {
    return next(req);
  }

  // don’t double-set if already present
  if (req.headers.has('Authorization')) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
    // keep cookies if your backend uses them; harmless otherwise:
    withCredentials: true,
  });

  return next(authReq);
};
