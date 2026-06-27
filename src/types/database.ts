export type StaffRole = "admin" | "stylist" | "barber";

export type AppointmentStatus =
  | "booked"
  | "confirmed"
  | "completed"
  | "no-show"
  | "cancelled";

export type Staff = {
  id: string;
  auth_user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  photo_url: string | null;
  bio: string | null;
  specialties: string[];
  role: StaffRole;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export type Service = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  photo_url: string | null;
  duration_minutes: number;
  price_cents: number;
  price_is_starting_at: boolean;
  requires_deposit: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export type StaffService = {
  staff_id: string;
  service_id: string;
}

export type Availability = {
  id: string;
  staff_id: string;
  day_of_week: number; // 0 = Sunday ... 6 = Saturday
  start_time: string; // "HH:MM:SS"
  end_time: string;
  created_at: string;
}

export type BlockedTime = {
  id: string;
  staff_id: string | null;
  date: string; // "YYYY-MM-DD"
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  created_at: string;
}

export type Appointment = {
  id: string;
  staff_id: string;
  service_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  start_time: string; // ISO timestamptz
  end_time: string;
  status: AppointmentStatus;
  stripe_payment_intent_id: string | null;
  deposit_paid: boolean;
  client_notes: string | null;
  internal_notes: string | null;
  cancel_token: string;
  created_at: string;
  updated_at: string;
}

export type SettingsRow = {
  key: string;
  value: unknown;
}

export type ShopInfo = {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  timezone: string;
  hours: Record<string, string>;
}

export type BookingSettings = {
  deposit_enabled: boolean;
  deposit_amount_cents: number;
  buffer_minutes: number;
  slot_increment_minutes: number;
}

export type AppointmentByTokenResult = {
  id: string;
  staff_name: string;
  service_name: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  client_name: string;
  price_cents: number;
  deposit_paid: boolean;
}

// ---------------------------------------------------------------------
// Supabase Database type. Mirrors the GenericSchema shape expected by
// @supabase/postgrest-js (Tables / Views / Functions, each with
// Row/Insert/Update/Relationships).
// ---------------------------------------------------------------------

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      staff: Table<
        Staff,
        Partial<Staff> & { name: string; email: string },
        Partial<Staff>
      >;
      services: Table<
        Service,
        Partial<Service> & {
          name: string;
          duration_minutes: number;
          price_cents: number;
        },
        Partial<Service>
      >;
      staff_services: Table<StaffService, StaffService, Partial<StaffService>>;
      availability: Table<
        Availability,
        Partial<Availability> & {
          staff_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
        },
        Partial<Availability>
      >;
      blocked_times: Table<
        BlockedTime,
        Partial<BlockedTime> & { date: string },
        Partial<BlockedTime>
      >;
      appointments: Table<
        Appointment,
        Partial<Appointment> & {
          staff_id: string;
          service_id: string;
          client_name: string;
          client_email: string;
          client_phone: string;
          start_time: string;
          end_time: string;
        },
        Partial<Appointment>
      >;
      settings: Table<SettingsRow, SettingsRow, Partial<SettingsRow>>;
    };
    Views: Record<string, never>;
    Functions: {
      get_busy_intervals: {
        Args: {
          p_staff_id: string;
          p_range_start: string;
          p_range_end: string;
        };
        Returns: { start_time: string; end_time: string }[];
      };
      create_appointment: {
        Args: {
          p_staff_id: string;
          p_service_id: string;
          p_start_time: string;
          p_client_name: string;
          p_client_email: string;
          p_client_phone: string;
          p_client_notes: string | null;
        };
        Returns: Appointment;
      };
      get_appointment_by_cancel_token: {
        Args: { p_token: string };
        Returns: AppointmentByTokenResult[];
      };
      cancel_appointment_by_token: {
        Args: { p_token: string };
        Returns: Appointment;
      };
    };
  };
};
