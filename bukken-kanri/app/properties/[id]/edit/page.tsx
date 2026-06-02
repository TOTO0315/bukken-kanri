"use client";

// ===================================================================
// 編集ページ。URLのID（/properties/〇〇/edit の〇〇部分）を読み取り、
// その物件を探してフォームに表示します。
// ===================================================================

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PropertyForm from "@/components/PropertyForm";
import { Property } from "@/lib/types";
import { getById } from "@/lib/storage";

export default function EditPropertyPage() {
  const params = useParams();
  const id = String(params.id);

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getById(id).then((p) => {
      setProperty(p);
      setLoading(false);
    });
  }, [id]);

  return (
    <main className="container">
      <Link href="/" className="back-link">
        ← 一覧に戻る
      </Link>
      <h1 className="page-title">物件を編集</h1>

      {loading ? (
        <div className="empty">読み込み中...</div>
      ) : !property ? (
        <div className="empty">
          <p>物件が見つかりませんでした。</p>
          <Link href="/" className="btn btn-primary">
            一覧に戻る
          </Link>
        </div>
      ) : (
        <PropertyForm initial={property} />
      )}
    </main>
  );
}
