import { v4 as uuidv4 } from 'uuid';
import Bank from '@/models/bank';
import User from '@/models/user';
import BankAccount from '@/models/bank-account';
import { UserId, BankAccountId } from '@/types/Common';

class GlobalRegistry {
  private static banks: Map<string, Bank> = new Map();
  private static users: Map<UserId, User> = new Map();
  private static accounts: Map<BankAccountId, BankAccount> = new Map();

  static registerBank(bank: Bank): void {
    this.banks.set(bank.getId(), bank);
  }

  static registerUser(user: User): void {
    this.users.set(user.getId(), user);
  }

  static registerAccount(account: BankAccount): void {
    this.accounts.set(account.getId(), account);
  }

  static getBank(bankId: string): Bank | undefined {
    return this.banks.get(bankId);
  }

  static getUser(userId: UserId): User | undefined {
    return this.users.get(userId);
  }

  static getAccount(accountId: BankAccountId): BankAccount | undefined {
    return this.accounts.get(accountId);
  }

  static clear(): void {
    this.banks.clear();
    this.users.clear();
    this.accounts.clear();
  }

  static generateId(): string {
    return uuidv4();
  }
}

export default GlobalRegistry; 