export interface Client {
  id: string;
  encrypted_data: string;
  salt: string;
  iv: string;
  created_at: string;
  updated_at: string;
  decrypted_data?:
    | {
        first_name: string;
        last_name: string;
        email: string;
        priority?: string;
        status?: string;
        pitch_deck_id?: string;
        strategy_id?: string;
      }
    | { error: string };
}

export interface PitchDeck {
  id: string;
  user_id: string;
  encrypted_data: string;
  salt: string;
  iv: string;
  created_at: string;
  decrypted_data?:
    | {
        name: string;
        file_path?: string;
        notes?: string;
      }
    | { error: string };
}

export interface Strategy {
  id: string;
  user_id: string;
  encrypted_data: string;
  salt: string;
  iv: string;
  created_at: string;
  updated_at: string;
  decrypted_data?:
    | {
        title: string;
        steps: string[];
      }
    | { error: string };
}
