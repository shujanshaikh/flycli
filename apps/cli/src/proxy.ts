import { createProxyMiddleware } from "http-proxy-middleware";

export const PORT = 3000;
export const DEV_PORT = 3100;

export const proxy = createProxyMiddleware({
  target: `http://localhost:${PORT}`,
  changeOrigin: true,
  ws : true,
  followRedirects: false,
  cookieDomainRewrite: {
    "*" : "",
  },
  router : () => {
      return `http://localhost:${PORT}`;
  },
    // Don't proxy toolbar routes
    pathFilter: (pathname) => {
      const shouldSkip = pathname.startsWith('/') 
      ||  pathname.startsWith('/ws');
      return !shouldSkip;
    },
  autoRewrite: true,
  preserveHeaderKeyCase: true,
  xfwd: true,
});