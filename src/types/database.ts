export type ItemStatus = "available" | "borrowed" | "paused";

export type RequestStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "deposit_paid"
  | "picked_up"
  | "returned"
  | "completed"
  | "cancelled";

export type DepositStatus = "unpaid" | "paid" | "confirmed" | "refunded";

export interface UserProfile {
  id: string;
  full_name: string;
  hostel_block: string;
  phone: string;
  upi_id?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Item {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: "cycle" | "drafter" | "lab_coat" | "camera" | "electronics" | "sports" | "books" | "other";
  photo_url: string | null;
  deposit_amount: number;
  status: ItemStatus;
  created_at: string;
  updated_at?: string;
  owner?: UserProfile;
}

export interface BorrowRequest {
  id: string;
  item_id: string;
  borrower_id: string;
  message: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at?: string;
  item?: Item;
  borrower?: UserProfile;
  deposit?: Deposit;
  ratings?: Rating[];
}

export interface Deposit {
  id: string;
  request_id: string;
  amount: number;
  paid_at: string | null;
  confirmed_at: string | null;
  refunded_at: string | null;
  status: DepositStatus;
  created_at: string;
}

export interface Rating {
  id: string;
  request_id: string;
  rater_id: string;
  ratee_id: string;
  stars: number; // 1-5
  comment: string | null;
  created_at: string;
  rater?: UserProfile;
}

