"use client"; // ← ブラウザ側で動く部品、という宣言（入力やクリックを扱うため必要）

// ===================================================================
// 物件の「登録」と「編集」で共通して使うフォームです。
// 入力するとすぐ下に自動計算の結果が出ます。
// ===================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Property,
  PropertyInput,
  PropertyType,
  USE_ZONES,
  ROAD_TYPES,
  ROUTES,
  STATUSES,
} from "@/lib/types";
import { calculate, fmt } from "@/lib/calc";
import { create, update } from "@/lib/storage";

// 空っぽの初期値（新規登録のとき使う）
function emptyInput(type: PropertyType): PropertyInput {
  return {
    type,
    address: "",
    areaSqm: null,
    price: null,
    station: "",
    stationDistance: null,
    useZone: "",
    buildingCoverage: null,
    floorAreaRatio: null,
    roadType: "",
    roadWidth: null,
    note: "",
    yieldRate: null,
    units: null,
    rentableArea: null,
    source: "",
    staff: "",
    route: "",
    status: "",
    acquiredDate: "",
    docUrl: "",
  };
}

type Props = {
  // 編集のときは既存データを渡す。新規のときは渡さない。
  initial?: Property;
};

export default function PropertyForm({ initial }: Props) {
  const router = useRouter();

  // フォームの中身を覚えておく箱
  const [form, setForm] = useState<PropertyInput>(
    initial ? { ...initial } : emptyInput("land")
  );
  const [saving, setSaving] = useState(false);

  const isIncome = form.type === "income";

  // 文字の項目を更新する関数
  function setText(key: keyof PropertyInput, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // 数字の項目を更新する関数（空欄なら null にする）
  function setNum(key: keyof PropertyInput, value: string) {
    const num = value === "" ? null : Number(value);
    setForm((prev) => ({ ...prev, [key]: num }));
  }

  // 自動計算（入力のたびに計算し直される）
  const calc = calculate({
    ...(form as Property),
    id: "preview",
    createdAt: "",
    updatedAt: "",
  });

  // 保存ボタンを押したときの処理
  async function handleSave() {
    if (!form.address.trim()) {
      alert("住所を入力してください。");
      return;
    }
    setSaving(true);
    try {
      if (initial) {
        await update(initial.id, form);
      } else {
        await create(form);
      }
      router.push("/"); // 一覧に戻る
      router.refresh();
    } catch (e) {
      alert("保存に失敗しました。");
      setSaving(false);
    }
  }

  return (
    <div>
      {/* --- 種類の選択（新規のときだけ切替可能） --- */}
      <div className="form-section">
        <h2>物件の種類</h2>
        <div className="tabs">
          <div
            className={`tab ${!isIncome ? "active" : ""}`}
            onClick={() => !initial && setForm((p) => ({ ...p, type: "land" }))}
            style={{ cursor: initial ? "not-allowed" : "pointer" }}
          >
            土地情報
          </div>
          <div
            className={`tab ${isIncome ? "active" : ""}`}
            onClick={() =>
              !initial && setForm((p) => ({ ...p, type: "income" }))
            }
            style={{ cursor: initial ? "not-allowed" : "pointer" }}
          >
            収益物件情報
          </div>
        </div>
        {initial && (
          <p className="hint">※ 登録後に種類は変更できません。</p>
        )}
      </div>

      {/* --- 基本情報 --- */}
      <div className="form-section">
        <h2>基本情報</h2>

        <div className="field">
          <label>住所 <span className="hint">（必須）</span></label>
          <input
            value={form.address}
            onChange={(e) => setText("address", e.target.value)}
            placeholder="例：大阪市北区梅田1-1-1"
          />
        </div>

        <div className="row">
          <div className="field">
            <label>地積㎡</label>
            <input
              type="number"
              inputMode="decimal"
              value={form.areaSqm ?? ""}
              onChange={(e) => setNum("areaSqm", e.target.value)}
              placeholder="例：165.28"
            />
          </div>
          <div className="field">
            <label>価格 <span className="hint">（万円）</span></label>
            <input
              type="number"
              inputMode="decimal"
              value={form.price ?? ""}
              onChange={(e) => setNum("price", e.target.value)}
              placeholder="例：5000"
            />
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label>最寄り駅</label>
            <input
              value={form.station}
              onChange={(e) => setText("station", e.target.value)}
              placeholder="例：梅田駅"
            />
          </div>
          <div className="field">
            <label>駅距離 <span className="hint">（分）</span></label>
            <input
              type="number"
              inputMode="numeric"
              value={form.stationDistance ?? ""}
              onChange={(e) => setNum("stationDistance", e.target.value)}
              placeholder="例：8"
            />
          </div>
        </div>

        <div className="field">
          <label>用途地域</label>
          <select
            value={form.useZone}
            onChange={(e) => setText("useZone", e.target.value)}
          >
            <option value="">選択してください</option>
            {USE_ZONES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>

        <div className="row">
          <div className="field">
            <label>建蔽率 <span className="hint">（%）</span></label>
            <input
              type="number"
              inputMode="numeric"
              value={form.buildingCoverage ?? ""}
              onChange={(e) => setNum("buildingCoverage", e.target.value)}
              placeholder="例：60"
            />
          </div>
          <div className="field">
            <label>容積率 <span className="hint">（%）</span></label>
            <input
              type="number"
              inputMode="numeric"
              value={form.floorAreaRatio ?? ""}
              onChange={(e) => setNum("floorAreaRatio", e.target.value)}
              placeholder="例：200"
            />
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label>道路種別</label>
            <select
              value={form.roadType}
              onChange={(e) => setText("roadType", e.target.value)}
            >
              <option value="">選択してください</option>
              {ROAD_TYPES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>道路幅員 <span className="hint">（m）</span></label>
            <input
              type="number"
              inputMode="decimal"
              value={form.roadWidth ?? ""}
              onChange={(e) => setNum("roadWidth", e.target.value)}
              placeholder="例：4.0"
            />
          </div>
        </div>
      </div>

      {/* --- 収益物件のときだけ表示される項目 --- */}
      {isIncome && (
        <div className="form-section">
          <h2>収益物件の情報</h2>
          <div className="row">
            <div className="field">
              <label>利回り <span className="hint">（%）</span></label>
              <input
                type="number"
                inputMode="decimal"
                value={form.yieldRate ?? ""}
                onChange={(e) => setNum("yieldRate", e.target.value)}
                placeholder="例：6.5"
              />
            </div>
            <div className="field">
              <label>戸数</label>
              <input
                type="number"
                inputMode="numeric"
                value={form.units ?? ""}
                onChange={(e) => setNum("units", e.target.value)}
                placeholder="例：12"
              />
            </div>
          </div>
          <div className="field">
            <label>貸床面積 <span className="hint">（㎡）</span></label>
            <input
              type="number"
              inputMode="decimal"
              value={form.rentableArea ?? ""}
              onChange={(e) => setNum("rentableArea", e.target.value)}
              placeholder="例：480.5"
            />
          </div>
        </div>
      )}

      {/* --- 自動計算の結果（入力するとリアルタイムで変わる） --- */}
      <div className="calc-box">
        <h2>📊 自動計算</h2>
        <div className="calc-grid">
          <div className="calc-item">
            <div className="label">地積坪</div>
            <div className="value">
              {fmt(calc.areaTsubo)}
              <span className="unit">坪</span>
            </div>
          </div>
          <div className="calc-item">
            <div className="label">坪単価</div>
            <div className="value">
              {fmt(calc.pricePerTsubo)}
              <span className="unit">万円/坪</span>
            </div>
          </div>
          {!isIncome && (
            <div className="calc-item">
              <div className="label">一種単価</div>
              <div className="value">
                {fmt(calc.pricePerType1)}
                <span className="unit">万円/坪</span>
              </div>
            </div>
          )}
          {isIncome && (
            <>
              <div className="calc-item">
                <div className="label">専有単価 税別</div>
                <div className="value">
                  {fmt(calc.unitPriceExclTax)}
                  <span className="unit">万円/㎡</span>
                </div>
              </div>
              <div className="calc-item">
                <div className="label">専有単価 税込</div>
                <div className="value">
                  {fmt(calc.unitPriceInclTax)}
                  <span className="unit">万円/㎡</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- 管理メモ --- */}
      <div className="form-section">
        <h2>管理メモ</h2>
        <div className="row">
          <div className="field">
            <label>情報元</label>
            <input
              value={form.source}
              onChange={(e) => setText("source", e.target.value)}
              placeholder="例：〇〇不動産"
            />
          </div>
          <div className="field">
            <label>担当者</label>
            <input
              value={form.staff}
              onChange={(e) => setText("staff", e.target.value)}
              placeholder="例：山田"
            />
          </div>
        </div>
        <div className="row">
          <div className="field">
            <label>ルート</label>
            <select
              value={form.route}
              onChange={(e) => setText("route", e.target.value)}
            >
              <option value="">選択してください</option>
              {ROUTES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>検討状況</label>
            <select
              value={form.status}
              onChange={(e) => setText("status", e.target.value)}
            >
              <option value="">選択してください</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label>入手日</label>
          <input
            type="date"
            value={form.acquiredDate}
            onChange={(e) => setText("acquiredDate", e.target.value)}
          />
        </div>
        <div className="field">
          <label>資料URL <span className="hint">（PDFや図面のリンク）</span></label>
          <input
            type="url"
            value={form.docUrl}
            onChange={(e) => setText("docUrl", e.target.value)}
            placeholder="例：https://..."
          />
        </div>
        <div className="field">
          <label>備考</label>
          <textarea
            value={form.note}
            onChange={(e) => setText("note", e.target.value)}
            placeholder="自由メモ"
          />
        </div>
      </div>

      {/* --- 保存・キャンセル --- */}
      <div className="form-footer">
        <button
          className="btn btn-outline"
          onClick={() => router.push("/")}
          disabled={saving}
        >
          キャンセル
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "保存中..." : initial ? "更新する" : "登録する"}
        </button>
      </div>
    </div>
  );
}
