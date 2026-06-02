// ===================================================================
// データの保存・読み込みを担当するファイルです。
//
// 【重要：Supabase移行のキモ】
// アプリの他の部分は、この5つの関数（getAll / getById / create /
// update / remove）だけを呼びます。中身が localStorage でも Supabase
// でも、呼び出し方は同じです。
// だから将来は「このファイルの中身だけ」を書き換えれば移行できます。
// （関数を async（非同期）にしてあるのも、Supabaseに合わせるためです）
//
// 今は簡易版として、ブラウザの localStorage に保存します。
// ※localStorageは「今使っているブラウザの中」にだけ保存されます。
//   別のPCやスマホとは共有されません（そこはSupabase移行で解決します）。
// ===================================================================

import { Property, PropertyInput } from "./types";

const STORAGE_KEY = "bukken-kanri:properties";

// ブラウザ上でだけ動くようにするためのチェック
function canUseStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

// 保存されている全データを読み込む（内部用）
function readRaw(): Property[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Property[]) : [];
  } catch {
    return [];
  }
}

// 全データを書き込む（内部用）
function writeRaw(list: Property[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// 簡単なユニークIDを作る
function makeId(): string {
  return (
    Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8)
  );
}

// -------------------------------------------------------------------
// ここから下が「アプリ全体が使う5つの関数」です。
// -------------------------------------------------------------------

// 全件取得（新しい順に並べて返す）
export async function getAll(): Promise<Property[]> {
  const list = readRaw();
  return list.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

// 1件取得
export async function getById(id: string): Promise<Property | null> {
  const list = readRaw();
  return list.find((p) => p.id === id) ?? null;
}

// 新規作成
export async function create(input: PropertyInput): Promise<Property> {
  const list = readRaw();
  const now = new Date().toISOString();
  const newItem: Property = {
    ...input,
    id: makeId(),
    createdAt: now,
    updatedAt: now,
  };
  list.push(newItem);
  writeRaw(list);
  return newItem;
}

// 更新
export async function update(
  id: string,
  input: PropertyInput
): Promise<Property | null> {
  const list = readRaw();
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const updated: Property = {
    ...list[index],
    ...input,
    id: list[index].id,
    createdAt: list[index].createdAt,
    updatedAt: new Date().toISOString(),
  };
  list[index] = updated;
  writeRaw(list);
  return updated;
}

// 削除
export async function remove(id: string): Promise<void> {
  const list = readRaw().filter((p) => p.id !== id);
  writeRaw(list);
}

// ===================================================================
// 【参考：将来Supabaseに移行するときのイメージ】
//
// 1. Supabaseで "properties" テーブルを作る（列はtypes.tsと同じ項目）
// 2. npm install @supabase/supabase-js
// 3. このファイルの中身を、例えば下のように書き換える：
//
//   import { createClient } from "@supabase/supabase-js";
//   const supabase = createClient(URL, ANON_KEY);
//
//   export async function getAll(): Promise<Property[]> {
//     const { data } = await supabase
//       .from("properties")
//       .select("*")
//       .order("updated_at", { ascending: false });
//     return data ?? [];
//   }
//   // create / update / remove も supabase.from(...).insert/update/delete に置き換え
//
// アプリの他のファイル（画面側）は一切変更不要です。
// ===================================================================
