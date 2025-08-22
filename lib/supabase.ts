

import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, processLock } from '@supabase/supabase-js'

export const supabase = createClient(
  "https://iptdzswzlsxptevqjkdg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdGR6c3d6bHN4cHRldnFqa2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTcwMzEsImV4cCI6MjA3MTQ3MzAzMX0.jcDQlBFO175g1qcG_BBoxG0Z-oNGBufpd56D1IxS4ek",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  })
        