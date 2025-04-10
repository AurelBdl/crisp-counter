export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      people: {
        Row: {
          id: string
          name: string
          count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          count?: number
          created_at?: string
        }
      }
    }
  }
}