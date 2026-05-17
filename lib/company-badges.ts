export interface CompanyBadge {
  label:  string;
  color:  string;
  bg:     string;
  border: string;
}

export const COMPANY_BADGES: Record<string, CompanyBadge> = {
  anthropic: { label: 'Anthropic', color: '#CC785C', bg: 'rgba(204,120,92,0.08)',  border: 'rgba(204,120,92,0.25)' },
  openai:    { label: 'OpenAI',    color: '#10a37f', bg: 'rgba(16,163,127,0.08)',  border: 'rgba(16,163,127,0.25)' },
  google:    { label: 'Google AI', color: '#4285f4', bg: 'rgba(66,133,244,0.08)',  border: 'rgba(66,133,244,0.25)' },
};
