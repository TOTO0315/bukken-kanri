// ===================================================================
// 自動計算をまとめたファイルです。
// 「地積㎡」や「価格」などの入力値から、坪単価などを計算します。
// 入力が空（null）のときは計算せず null を返します。
// ===================================================================

import { Property } from "./types";

// 1坪 = 3.305785 ㎡
const SQM_PER_TSUBO = 3.305785;

// 計算結果をまとめた型
export type Calculated = {
  areaTsubo: number | null; // 地積坪
  pricePerTsubo: number | null; // 坪単価（万円/坪）
  pricePerType1: number | null; // 一種単価（万円/坪）※土地用
  unitPriceExclTax: number | null; // 専有単価 税別（万円/㎡）※収益用
  unitPriceInclTax: number | null; // 専有単価 税込（万円/㎡）※収益用
};

// 値が「数字としてちゃんと使えるか」を判定する小さな関数
function isNum(v: number | null): v is number {
  return v !== null && !Number.isNaN(v) && Number.isFinite(v);
}

// メインの計算関数。物件1件を渡すと計算結果を返します。
export function calculate(p: Property): Calculated {
  // 地積坪 = 地積㎡ ÷ 3.305785
  const areaTsubo = isNum(p.areaSqm) ? p.areaSqm / SQM_PER_TSUBO : null;

  // 坪単価 = 価格 ÷ 地積坪
  const pricePerTsubo =
    isNum(p.price) && isNum(areaTsubo) && areaTsubo !== 0
      ? p.price / areaTsubo
      : null;

  // 一種単価 = 価格 ÷ 地積坪 ÷ 容積率 × 100
  const pricePerType1 =
    isNum(p.price) &&
    isNum(areaTsubo) &&
    areaTsubo !== 0 &&
    isNum(p.floorAreaRatio) &&
    p.floorAreaRatio !== 0
      ? (p.price / areaTsubo / p.floorAreaRatio) * 100
      : null;

  // 専有単価 税別 = 価格 ÷ 貸床面積
  const unitPriceExclTax =
    isNum(p.price) && isNum(p.rentableArea) && p.rentableArea !== 0
      ? p.price / p.rentableArea
      : null;

  // 専有単価 税込 = 専有単価 税別 × 1.1
  const unitPriceInclTax = isNum(unitPriceExclTax)
    ? unitPriceExclTax * 1.1
    : null;

  return {
    areaTsubo,
    pricePerTsubo,
    pricePerType1,
    unitPriceExclTax,
    unitPriceInclTax,
  };
}

// 数字を見やすく整える（小数2桁＋3桁区切りカンマ）。null のときは「—」を返す。
export function fmt(v: number | null, digits = 2): string {
  if (v === null || Number.isNaN(v) || !Number.isFinite(v)) return "—";
  return v.toLocaleString("ja-JP", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

// 整数向けの表示（戸数など）
export function fmtInt(v: number | null): string {
  if (v === null || Number.isNaN(v) || !Number.isFinite(v)) return "—";
  return v.toLocaleString("ja-JP");
}
