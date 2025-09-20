import type { SVGProps } from 'react';

export function OpenAIIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zM8.13 5.27c-.36.2-.6.57-.6.98v7.5c0 .41.24.78.6.98l5.55-3.21c.36-.2.6-.57.6-.98s-.24-.78-.6-.98L8.13 5.27z"
      />
    </svg>
  );
}

export function AnthropicIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v8h-2v-8zm-4 4h2v4h-2v-4z" />
    </svg>
  );
}

export function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5.03,16.42 5.03,12.59C5.03,8.76 8.36,5.91 12.19,5.91C14.02,5.91 15.44,6.52 16.6,7.63L18.7,5.53C16.89,3.83 14.73,2.91 12.19,2.91C6.93,2.91 3,7.02 3,12.59C3,18.16 6.93,22.27 12.19,22.27C17.62,22.27 21.5,18.33 21.5,12.82C21.5,12.03 21.45,11.56 21.35,11.1Z" />
    </svg>
  );
}

export function PerplexityIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Zm0-14a6,6,0,1,0,6,6A6,6,0,0,0,12,6Zm0,10a4,4,0,1,1,4-4A4,4,0,0,1,12,16Z" />
    </svg>
  );
}

export function GroqIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5zM12 12l-10-5 10-5 10 5-10 5z" />
    </svg>
  );
}
