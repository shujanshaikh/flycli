import { getAppPort } from '@/lib/utils/app-port';

export function AppFrame() {
  const appPort = getAppPort();

  return (
    <iframe
      src={`http://localhost:${appPort}`}
      allow="geolocation *; clipboard-read; clipboard-write;"
      className="absolute inset-0 w-full h-full border-0 bg-zinc-950"
      style={{
        zIndex: 0,
      }}
    />
  );
}

