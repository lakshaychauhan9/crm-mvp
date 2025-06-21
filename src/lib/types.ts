// export interface Client {
//   id: string;
//   encrypted_data: string;
//   salt: string;
//   iv: string;
//   created_at: string;
//   updated_at: string;
//   decrypted_data?:
//     | {
//         first_name?: string;
//         last_name?: string;
//         email?: string;
//         priority?: string;
//         status?: string;
//         pitch_deck_id?: string;
//         strategy_id?: string;
//       }
//     | { error: string };
// }

// export interface PitchDeck {
//   id: string;
//   user_id: string;
//   encrypted_data: string;
//   salt: string;
//   iv: string;
//   created_at: string;
//   decrypted_data?:
//     | {
//         name?: string;
//         file_path?: string;
//         notes?: string;
//       }
//     | { error: string };
// }

// export interface Strategy {
//   id: string;
//   user_id: string;
//   encrypted_data: string;
//   salt: string;
//   iv: string;
//   created_at: string;
//   updated_at: string;
//   decrypted_data?:
//     | {
//         title?: string;
//         steps?: string[];
//       }
//     | { error: string };
// }

// export interface JournalEntry {
//   id: string;
//   user_id: string;
//   encrypted_data: string;
//   salt: string;
//   iv: string;
//   created_at: string;
//   updated_at: string;
//   decrypted_data?:
//     | {
//         title?: string;
//         content?: string;
//       }
//     | { error: string };
// }

/**
 * Type definitions for Client Tracker.
 * Defines interfaces for Client, PitchDeck, Strategy, and DataState.
 * Why: Ensures type safety across the app.
 * How: Used in store, API routes, and components.
 * Changes:
 * - Added phone, company, notes to Client.decrypted_data.
 * - Fixed PitchDeck.decrypted_data to use title consistently.
 * - Defined DataState for store.ts.
 */
export interface Client {
  id: string;
  user_id: string;
  encrypted_data: string;
  iv: string;
  salt: string;
  created_at: string;
  updated_at: string;
  decrypted_data:
    | {
        first_name?: string;
        last_name?: string;
        email: string;
        phone?: string;
        company?: string;
        priority?: string;
        status?: string;
        pitch_deck_id?: string;
        strategy_id?: string;
        notes?: string;
      }
    | { error: string };
}

export interface PitchDeck {
  id: string;
  user_id: string;
  encrypted_data: string;
  iv: string;
  salt: string;
  created_at: string;
  updated_at: string;
  decrypted_data:
    | {
        title: string;
        description?: string;
        file_url?: string;
      }
    | { error: string };
}

export interface Strategy {
  id: string;
  user_id: string;
  encrypted_data: string;
  iv: string;
  salt: string;
  created_at: string;
  updated_at: string;
  decrypted_data:
    | {
        name: string;
        details?: string;
      }
    | { error: string };
}

export interface DataState {
  clients: Client[];
  pitchDecks: PitchDeck[];
  strategies: Strategy[];
  hasDataFetched: boolean;
  error: string | null;
}
