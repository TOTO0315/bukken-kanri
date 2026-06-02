// ===================================================================
// このファイルは「データの形（型）」を決める設計図です。
// ここを見れば、1件の物件にどんな情報が入るのかが分かります。
// ===================================================================

// 物件の種類は「土地」か「収益物件」の2つ
export type PropertyType = "land" | "income";

// 1件の物件が持つ情報
export type Property = {
  // --- システム用 ---
  id: string; // 自動で付く一意なID
  type: PropertyType; // land(土地) か income(収益物件)
  createdAt: string; // 登録日時
  updatedAt: string; // 更新日時

  // --- 共通の項目（土地・収益どちらも使う） ---
  address: string; // 住所
  areaSqm: number | null; // 地積㎡
  price: number | null; // 価格（単位：万円）
  station: string; // 最寄り駅
  stationDistance: number | null; // 駅距離（分）
  useZone: string; // 用途地域
  buildingCoverage: number | null; // 建蔽率（%）例: 60
  floorAreaRatio: number | null; // 容積率（%）例: 200
  roadType: string; // 道路種別
  roadWidth: number | null; // 道路幅員（m）
  note: string; // 備考

  // --- 収益物件だけで使う項目 ---
  yieldRate: number | null; // 利回り（%）
  units: number | null; // 戸数
  rentableArea: number | null; // 貸床面積（㎡）

  // --- 管理メモ（土地・収益どちらも使う / あとから追加した項目） ---
  source: string; // 情報元
  staff: string; // 担当者
  route: string; // ルート（売主直・仲介・買側仲介など）
  status: string; // 検討状況
  acquiredDate: string; // 入手日（YYYY-MM-DD）
  docUrl: string; // 資料URL（PDFなどのリンク）
};

// 新規登録のときに使う「IDや日時がまだ無い状態」の型
export type PropertyInput = Omit<Property, "id" | "createdAt" | "updatedAt">;

// ===================================================================
// 入力欄の「選択肢」をここでまとめて管理します。
// 増やしたいときはこの配列に文字を足すだけでOKです。
// ===================================================================

// 用途地域の選択肢
export const USE_ZONES = [
  "第一種低層住居専用地域",
  "第二種低層住居専用地域",
  "第一種中高層住居専用地域",
  "第二種中高層住居専用地域",
  "第一種住居地域",
  "第二種住居地域",
  "準住居地域",
  "近隣商業地域",
  "商業地域",
  "準工業地域",
  "工業地域",
  "工業専用地域",
  "田園住居地域",
  "市街化調整区域",
  "その他",
];

// 道路種別の選択肢
export const ROAD_TYPES = [
  "公道",
  "私道",
  "位置指定道路",
  "二項道路（みなし道路）",
  "その他",
];

// ルートの選択肢
export const ROUTES = ["売主直", "仲介", "買側仲介", "その他"];

// 検討状況の選択肢
export const STATUSES = [
  "未検討",
  "検討中",
  "資料請求済",
  "現地確認済",
  "見送り",
  "成約",
];
