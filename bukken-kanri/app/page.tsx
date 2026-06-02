"use client";

// ===================================================================
// トップ画面です。登録済みの物件を一覧表示します。
// ・タブで「すべて / 土地 / 収益物件」を切り替え
// ・検索ボックスで住所・駅・担当者などを絞り込み
// ・各カードから編集・削除ができます
// ===================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { Property, PropertyType } from "@/lib/types";
import { getAll, remove } from "@/lib/storage";
import { calculate, fmt, fmtInt } from "@/lib/calc";

type Filter = "all" | PropertyType;

export default function HomePage() {
  const [items, setItems] = useState<Property[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  // 画面を開いたときにデータを読み込む
  async function load() {
    setLoading(true);
    const data = await getAll();
    setItems(data);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  // 削除処理
  async function handleDelete(id: string, address: string) {
    if (!confirm(`「${address || "この物件"}」を削除しますか？`)) return;
    await remove(id);
    load(); // 削除後に再読み込み
  }

  // タブと検索で絞り込み
  const filtered = items.filter((p) => {
    if (filter !== "all" && p.type !== filter) return false;
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase();
      const target = [
        p.address,
        p.station,
        p.useZone,
        p.staff,
        p.source,
        p.route,
        p.status,
        p.note,
      ]
        .join(" ")
        .toLowerCase();
      if (!target.includes(k)) return false;
    }
    return true;
  });

  return (
    <main className="container">
      {/* タブ */}
      <div className="tabs">
        <div
          className={`tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          すべて
        </div>
        <div
          className={`tab ${filter === "land" ? "active" : ""}`}
          onClick={() => setFilter("land")}
        >
          土地
        </div>
        <div
          className={`tab ${filter === "income" ? "active" : ""}`}
          onClick={() => setFilter("income")}
        >
          収益物件
        </div>
      </div>

      {/* 検索 */}
      <input
        className="search"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="🔍 住所・駅・担当者などで検索"
      />

      {/* 一覧 */}
      {loading ? (
        <div className="empty">読み込み中...</div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <p>物件がまだありません。</p>
          <Link href="/properties/new" className="btn btn-primary">
            ＋ 最初の物件を登録する
          </Link>
        </div>
      ) : (
        filtered.map((p) => {
          const c = calculate(p);
          const isIncome = p.type === "income";
          return (
            <div className="card" key={p.id}>
              <div className="card-top">
                <span
                  className={`badge ${
                    isIncome ? "badge-income" : "badge-land"
                  }`}
                >
                  {isIncome ? "収益物件" : "土地"}
                </span>
                {p.status && <span className="badge badge-soft">{p.status}</span>}
              </div>

              <p className="card-address">{p.address || "（住所未入力）"}</p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-sub)" }}>
                {p.station && `${p.station}`}
                {p.station && p.stationDistance != null && ` 徒歩${p.stationDistance}分`}
                {p.useZone && ` ・ ${p.useZone}`}
              </p>

              <div className="card-grid">
                <div className="cell">
                  <div className="label">価格</div>
                  <div className="value">
                    {fmt(p.price, 0)}
                    <span className="unit">万円</span>
                  </div>
                </div>
                <div className="cell">
                  <div className="label">地積</div>
                  <div className="value">
                    {fmt(p.areaSqm)}
                    <span className="unit">㎡</span>
                  </div>
                </div>
                <div className="cell">
                  <div className="label">坪単価</div>
                  <div className="value">
                    {fmt(c.pricePerTsubo)}
                    <span className="unit">万/坪</span>
                  </div>
                </div>

                {/* 土地なら一種単価、収益なら利回り */}
                {isIncome ? (
                  <div className="cell">
                    <div className="label">利回り</div>
                    <div className="value">
                      {fmt(p.yieldRate)}
                      <span className="unit">%</span>
                    </div>
                  </div>
                ) : (
                  <div className="cell">
                    <div className="label">一種単価</div>
                    <div className="value">
                      {fmt(c.pricePerType1)}
                      <span className="unit">万/坪</span>
                    </div>
                  </div>
                )}

                {/* 収益物件の追加指標 */}
                {isIncome && (
                  <>
                    <div className="cell">
                      <div className="label">戸数</div>
                      <div className="value">
                        {fmtInt(p.units)}
                        <span className="unit">戸</span>
                      </div>
                    </div>
                    <div className="cell">
                      <div className="label">貸床面積</div>
                      <div className="value">
                        {fmt(p.rentableArea)}
                        <span className="unit">㎡</span>
                      </div>
                    </div>
                    <div className="cell">
                      <div className="label">専有単価(税別)</div>
                      <div className="value">
                        {fmt(c.unitPriceExclTax)}
                        <span className="unit">万/㎡</span>
                      </div>
                    </div>
                    <div className="cell">
                      <div className="label">専有単価(税込)</div>
                      <div className="value">
                        {fmt(c.unitPriceInclTax)}
                        <span className="unit">万/㎡</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {(p.staff || p.source || p.route) && (
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: 12,
                    color: "var(--text-sub)",
                  }}
                >
                  {p.source && `情報元: ${p.source}　`}
                  {p.staff && `担当: ${p.staff}　`}
                  {p.route && `ルート: ${p.route}`}
                </p>
              )}

              {p.docUrl && (
                <p style={{ margin: "0 0 8px", fontSize: 13 }}>
                  <a href={p.docUrl} target="_blank" rel="noopener noreferrer">
                    📎 資料を開く
                  </a>
                </p>
              )}

              <div className="card-actions">
                <Link
                  href={`/properties/${p.id}/edit`}
                  className="btn btn-outline"
                >
                  編集
                </Link>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(p.id, p.address)}
                >
                  削除
                </button>
              </div>
            </div>
          );
        })
      )}
    </main>
  );
}
