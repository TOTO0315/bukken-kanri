// ===================================================================
// すべてのページに共通する「外枠」です。
// ヘッダー（上の緑のバー）は全ページに表示されます。
// ===================================================================

import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "物件管理アプリ",
  description: "土地・収益物件の管理（MVP）",
};

// スマホで正しく拡大縮小させるための設定
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <header className="header">
          <div className="header-inner">
            <Link href="/">
              <h1>🏠 物件管理</h1>
            </Link>
            <Link href="/properties/new" className="btn btn-light">
              ＋ 新規登録
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
