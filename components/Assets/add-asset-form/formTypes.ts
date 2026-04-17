import type { Option } from "@/components/ui/select";

export type SelectOption = NonNullable<Option>;

export type StockActionMode = "add-stock" | "set-reorder-alert";

export type AddAssetFormProps = {
    onClose: () => void;
    presetAction?: StockActionMode;
};

export type AssetRecord = {
    id: string | number;
    asset_name: string;
    category: string | null;
    quantity: number | null;
    minimum_stock_level: number | null;
    status: string | null;
    condition: string | null;
    image_url: string | null;
    note: string | null;
};

export const CATEGORY_MIN_STOCK_LEVEL: Record<string, number> = {
    laptops: 2,
    monitors: 3,
    keyboards: 10,
    headphones: 5,
    cables: 30,
    accessories: 20,
};

export const DEFAULT_MIN_STOCK_LEVEL = 5;

export const categories: SelectOption[] = [
    { label: "Laptops", value: "laptops" },
    { label: "Monitors", value: "monitors" },
    { label: "Keyboards", value: "keyboards" },
    { label: "Headphones", value: "headphones" },
    { label: "Cables", value: "cables" },
    { label: "Accessories", value: "accessories" },
];

export const conditions: SelectOption[] = [
    { label: "New", value: "new" },
    { label: "Used", value: "used" },
    { label: "Good", value: "good" },
    { label: "Fair", value: "fair" },
    { label: "Refurbished", value: "refurbished" },
];

export const getThresholdForAsset = (asset: AssetRecord) => {
    if (typeof asset.minimum_stock_level === "number" && asset.minimum_stock_level > 0) {
        return asset.minimum_stock_level;
    }
    if (asset.category && CATEGORY_MIN_STOCK_LEVEL[asset.category]) {
        return CATEGORY_MIN_STOCK_LEVEL[asset.category];
    }
    return DEFAULT_MIN_STOCK_LEVEL;
};

export const getStockStatus = (qty: number, minLevel: number) => {
    if (qty <= 0) return "out-of-stock";
    if (qty <= minLevel) return "low-stock";
    return "in-stock";
};
