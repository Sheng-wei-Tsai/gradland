import '@testing-library/jest-dom';

// Fake env vars for all tests — routes create supabase clients at module level
process.env.NEXT_PUBLIC_SUPABASE_URL    = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY   = 'test-service-key';
process.env.NEXT_PUBLIC_APP_URL         = 'https://henrysdigitallife.com';
