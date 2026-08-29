import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import {
  Transaction,
  Customer,
  TransactionFilterParams,
} from "../types/transaction.js";
import { generateSyntheticTransactions } from "./dataGenerator.js";

export class DatabaseService {
  private supabase: SupabaseClient | null = null;
  private inMemoryTransactions: Transaction[] = [];
  private inMemoryCustomers: Customer[] = [];
  private isUsingSupabase = false;

  constructor() {
    if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
      try {
        this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
        this.isUsingSupabase = true;
        console.log("⚡ Connected to Supabase PostgreSQL Database");
      } catch (err) {
        console.warn("⚠️ Failed to initialize Supabase client, falling back to in-memory store:", err);
      }
    } else {
      console.log("ℹ️ No Supabase credentials found in environment. Initializing high-speed in-memory store for Revora.");
    }

    // Initialize with synthetic data for out-of-the-box demo
    this.seedInMemoryStore();
  }

  public seedInMemoryStore(count = env.SIMULATION_DATA_SIZE) {
    const { transactions, customers } = generateSyntheticTransactions(count, undefined, true);
    this.inMemoryTransactions = transactions;
    this.inMemoryCustomers = customers;
    console.log(`✅ Seeded ${transactions.length} synthetic transactions and ${customers.length} customers.`);
  }

  public isSupabaseConnected(): boolean {
    return this.isUsingSupabase;
  }

  public async getTransactions(params: TransactionFilterParams): Promise<{
    data: Transaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let filtered = [...this.inMemoryTransactions];

    // Status filter
    if (params.status && params.status !== "ALL") {
      filtered = filtered.filter((t) => t.status === params.status);
    }

    // Method filter
    if (params.method && params.method !== "ALL") {
      filtered = filtered.filter((t) => t.paymentMethod === params.method);
    }

    // Issuer filter
    if (params.issuer && params.issuer !== "ALL") {
      filtered = filtered.filter((t) => t.issuerBank.toLowerCase() === params.issuer?.toLowerCase());
    }

    // Failure Category filter
    if (params.failureCategory && params.failureCategory !== "ALL") {
      filtered = filtered.filter((t) => t.failureCategory === params.failureCategory);
    }

    // Amount range
    if (params.minAmount !== undefined) {
      filtered = filtered.filter((t) => t.amountInr >= (params.minAmount ?? 0));
    }
    if (params.maxAmount !== undefined) {
      filtered = filtered.filter((t) => t.amountInr <= (params.maxAmount ?? Infinity));
    }

    // Search query (Transaction ID, Customer ID, Order ID, Customer Name, Email, Failure Code)
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.orderId.toLowerCase().includes(q) ||
          t.customerId.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.customerEmail.toLowerCase().includes(q) ||
          (t.failureCode && t.failureCode.toLowerCase().includes(q)) ||
          (t.failureReason && t.failureReason.toLowerCase().includes(q))
      );
    }

    // Date range filter
    if (params.startDate) {
      const startMs = new Date(params.startDate).getTime();
      filtered = filtered.filter((t) => new Date(t.createdAt).getTime() >= startMs);
    }
    if (params.endDate) {
      const endMs = new Date(params.endDate).getTime();
      filtered = filtered.filter((t) => new Date(t.createdAt).getTime() <= endMs);
    }

    // Sorting
    filtered.sort((a, b) => {
      let valA: number | string = a.createdAt;
      let valB: number | string = b.createdAt;

      if (params.sortBy === "amountInr") {
        valA = a.amountInr;
        valB = b.amountInr;
      } else if (params.sortBy === "retryCount") {
        valA = a.retryCount;
        valB = b.retryCount;
      } else {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }

      if (params.sortOrder === "asc") {
        return valA > valB ? 1 : -1;
      }
      return valA < valB ? 1 : -1;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / params.limit) || 1;
    const page = Math.min(params.page, totalPages);
    const startIdx = (page - 1) * params.limit;
    const paginated = filtered.slice(startIdx, startIdx + params.limit);

    return {
      data: paginated,
      total,
      page,
      limit: params.limit,
      totalPages,
    };
  }

  public async getTransactionById(id: string): Promise<Transaction | null> {
    const txn = this.inMemoryTransactions.find((t) => t.id === id);
    return txn || null;
  }

  public getAllRawTransactions(): Transaction[] {
    return this.inMemoryTransactions;
  }

  public getCustomers(): Customer[] {
    return this.inMemoryCustomers;
  }
}

export const dbService = new DatabaseService();
