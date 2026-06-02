// ===================================================================
// 新規登録ページ。フォームを表示するだけのシンプルな画面です。
// ===================================================================

import Link from "next/link";
import PropertyForm from "@/components/PropertyForm";

export default function NewPropertyPage() {
  return (
    <main className="container">
      <Link href="/" className="back-link">
        ← 一覧に戻る
      </Link>
      <h1 className="page-title">物件を新規登録</h1>
      <PropertyForm />
    </main>
  );
}
