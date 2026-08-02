export interface MFFundSearchResult {
  schemeCode: number;
  schemeName: string;
}

export interface MFFundMeta {
  fund_house: string;
  scheme_type: string;
  scheme_category: string;
  scheme_code: number;
  scheme_name: string;
  isin_growth: string;
  isin_div_reinvestment: string | null;
}

export interface MFNavEntry {
  date: string;
  nav: string;
}

export interface MFFundDataResponse {
  meta: MFFundMeta;
  data: MFNavEntry[];
  status: string;
}

export interface ProcessedFundData {
  schemeCode: number;
  schemeName: string;
  fundHouse: string;
  schemeType: string;
  schemeCategory: string;
  isinGrowth: string;
  currentNav: number;
  navDate: string;
  navHistory: { date: string; nav: number }[];
  returns: {
    "1Y": number | null;
    "3Y": number | null;
    "5Y": number | null;
    allTime: number | null;
  };
}

export interface FundCompareFund {
  id: string;
  schemeCode: number;
  schemeName: string;
  fundHouse: string;
  schemeCategory: string;
  currentNav: number;
  navDate: string;
  returns: {
    "1Y": number | null;
    "3Y": number | null;
    "5Y": number | null;
    allTime: number | null;
  };
  navHistory: { date: string; nav: number }[];
}

export interface OverlapInfo {
  sameAmc: boolean;
  sameCategory: boolean;
  message: string;
}
