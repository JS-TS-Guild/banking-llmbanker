import GlobalRegistry from '@/services/GlobalRegistry';
import { BankAccountId } from '@/types/Common';

class BankAccount {
  private id: BankAccountId;
  private balance: number;
  private bankId: string;
  private isNegativeAllowed: boolean;

  constructor(bankId: string, initialBalance: number, isNegativeAllowed: boolean = false) {
    this.id = GlobalRegistry.generateId();
    this.balance = initialBalance;
    this.bankId = bankId;
    this.isNegativeAllowed = isNegativeAllowed;
    GlobalRegistry.registerAccount(this);
  }

  getId(): BankAccountId {
    return this.id;
  }

  getBalance(): number {
    return this.balance;
  }

  getBankId(): string {
    return this.bankId;
  }

  canHaveNegativeBalance(): boolean {
    return this.isNegativeAllowed;
  }

  deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }
    this.balance += amount;
  }

  withdraw(amount: number): void {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    
    if (!this.isNegativeAllowed && this.balance < amount) {
      throw new Error('Insufficient funds');
    }
    
    this.balance -= amount;
  }

  hasSufficientFunds(amount: number): boolean {
    return this.isNegativeAllowed || this.balance >= amount;
  }
}

export default BankAccount; 