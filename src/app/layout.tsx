import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const vietnam = Be_Vietnam_Pro({
  variable: "--font-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HRank Studio — Đưa doanh nghiệp đến gần khách hàng hơn",
  description: "Giải pháp SEO Google Map, website chuẩn SEO và tự động hóa AI cho doanh nghiệp nhỏ.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={vietnam.variable}
    >
      <body>
        <Script id="reload-scroll-reset" strategy="beforeInteractive">{reloadResetScript}</Script>
        {children}
      </body>
    </html>
  );
}

// 2026-11-09: Reset reloads before hydration; retain anchor navigation on normal visits.
const reloadResetScript = `(() => {
  const navigation = performance.getEntriesByType('navigation')[0];
  if (!navigation || navigation.type !== 'reload') return;
  history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
  const reset = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  reset();
  window.addEventListener('pageshow', reset, { once: true });
})();`;
