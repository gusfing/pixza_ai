import type { Metadata } from "next";

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://pixzastudio.com").replace(/\/$/, "");

export function createMetadata(opts: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = opts.path ? `${BASE_URL}${opts.path}` : BASE_URL;
  const image = opts.image ?? `${BASE_URL}/pixza-logo.png`;

  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    robots: opts.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      images: [{ url: image, width: 1200, height: 630, alt: opts.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
    },
  };
}
