import { createProxyMiddleware as createProxy } from "http-proxy-middleware";

export function createProxyMiddleware(appPort: number) {
  return createProxy({
    target: `http://localhost:${appPort}`,
    changeOrigin: true,
    ws: true,
    followRedirects: false,
    cookieDomainRewrite: {
      "*": "",
    },
    router: () => {
      return `http://localhost:${appPort}`;
    },
    // Don't proxy toolbar routes
    pathFilter: (pathname) => {
      const shouldSkip = pathname.startsWith('/') 
        || pathname.startsWith('/ws');
      return !shouldSkip;
    },
    autoRewrite: true,
    preserveHeaderKeyCase: true,
    xfwd: true,
  });
}