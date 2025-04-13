import { createClient } from "@supabase/supabase-js";

import type { Database } from "../db/database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type SupabaseClient = typeof supabaseClient;

export const DEFAULT_USER_ID = "fcd55182-29aa-4ed9-b7ee-b04754f7ae28";
export const DEFAULT_TOPIC_ID = "cb4762c2-c66b-4d6d-a645-6b23567e3bda";
