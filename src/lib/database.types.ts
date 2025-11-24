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
      garages: {
        Row: {
          id: string
          name: string
          address: string
          phone: string
          email: string
          license_number: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          phone: string
          email: string
          license_number: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string
          email?: string
          license_number?: string
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          vin: string
          make: string
          model: string
          year: number
          color: string | null
          engine_type: string | null
          transmission: string | null
          mileage: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vin: string
          make: string
          model: string
          year: number
          color?: string | null
          engine_type?: string | null
          transmission?: string | null
          mileage?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vin?: string
          make?: string
          model?: string
          year?: number
          color?: string | null
          engine_type?: string | null
          transmission?: string | null
          mileage?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_records: {
        Row: {
          id: string
          vehicle_id: string
          garage_id: string
          technician_id: string
          service_date: string
          mileage: number
          description: string
          diagnosis: string | null
          solution: string | null
          cost: number
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          photos: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          garage_id: string
          technician_id: string
          service_date: string
          mileage: number
          description: string
          diagnosis?: string | null
          solution?: string | null
          cost: number
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          photos?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          garage_id?: string
          technician_id?: string
          service_date?: string
          mileage?: number
          description?: string
          diagnosis?: string | null
          solution?: string | null
          cost?: number
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          photos?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}