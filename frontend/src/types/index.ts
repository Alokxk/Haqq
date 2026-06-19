export interface Law {
  act: string;
  act_short: string;
  section: string;
  title: string;
  summary: string;
  indiacode_url: string;
  last_updated: string;
  possibly_amended: boolean;
}

export interface Remedy {
  step: number;
  action: string;
  details: string;
  timeline: string;
}

export interface AnalyzeResponse {
  situation_id: string;
  share_url: string;
  domain: string;
  sub_domain: string;
  state: string | null;
  confidence: "high" | "medium" | "low";
  top_score: number;
  confidence_reason: string;
  fallback: boolean;
  cached: boolean;
  rights: string[];
  remedies: Remedy[];
  laws: Law[];
  evidence_checklist: string[];
  disclaimer: string;
  fallback_message?: string;
}

export interface Example {
  id: string;
  label: string;
  text: string;
}
