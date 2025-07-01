import GlobalRegistry from '@/services/GlobalRegistry';
import BankAccount from '@/models/bank-account';
import User from '@/models/user';
import { UserId, BankAccountId } from '@/types/Common';

interface BankOptions {
  isNegativeAllowed?: boolean;
}

class Bank {
  private id: string;
  private isNegativeAllowed: boolean;
  private accounts: Map<BankAccountId, BankAccount> = new Map();

  constructor(options: BankOptions = {}) {
    this.id = GlobalRegistry.generateId();
    this.isNegativeAllowed = options.isNegativeAllowed || false;
    GlobalRegistry.registerBank(this);
  }

  static create(options?: BankOptions): Bank {
    return new Bank(options);
  }

  getId(): string {
    return this.id;
  }

  allowsNegativeBalance(): boolean {
    return this.isNegativeAllowed;
  }

  createAccount(initialBalance: number): BankAccount {
    const account = new BankAccount(this.id, initialBalance, this.isNegativeAllowed);
    this.accounts.set(account.getId(), account);
    return account;
  }

  getAccount(accountId: BankAccountId): BankAccount {
    const account = this.accounts.get(accountId);
    if (!account) {
      // Try to get from GlobalRegistry as fallback
      const globalAccount = GlobalRegistry.getAccount(accountId);
      if (globalAccount && globalAccount.getBankId() === this.id) {
        return globalAccount;
      }
      throw new Error(`Account ${accountId} not found in bank ${this.id}`);
    }
    return account;
  }

  send(fromUserId: UserId, toUserId: UserId, amount: number, toBankId?: string): void {
    const fromUser = GlobalRegistry.getUser(fromUserId);
    const toUser = GlobalRegistry.getUser(toUserId);

    if (!fromUser || !toUser) {
      throw new Error('User not found');
    }

    // Get accounts for the sender in this bank
    const fromUserAccounts = fromUser.getAccountsInBank(this.id);
    if (fromUserAccounts.length === 0) {
      throw new Error('Sender has no accounts in this bank');
    }

    // Try to find sufficient funds across all accounts
    let remainingAmount = amount;
    const accountsToUse: { account: BankAccount; amount: number }[] = [];

    for (const accountId of fromUserAccounts) {
      const account = this.getAccount(accountId);
      
      if (this.isNegativeAllowed) {
        // For banks that allow negative balance, use the first account and let it go negative
        accountsToUse.push({ account, amount: remainingAmount });
        remainingAmount = 0;
        break;
      } else {
        // For banks that don't allow negative balance, only use positive balances
        const availableBalance = account.getBalance();
        if (availableBalance > 0) {
          const amountToUse = Math.min(remainingAmount, availableBalance);
          accountsToUse.push({ account, amount: amountToUse });
          remainingAmount -= amountToUse;
          
          if (remainingAmount <= 0) {
            break;
          }
        }
      }
    }

    if (remainingAmount > 0) {
      throw new Error('Insufficient funds');
    }

    // Handle recipient
    if (toBankId && toBankId !== this.id) {
      // Transfer to different bank
      const toBank = GlobalRegistry.getBank(toBankId);
      if (!toBank) {
        throw new Error('Recipient bank not found');
      }

      const toUserAccounts = toUser.getAccountsInBank(toBankId);
      if (toUserAccounts.length === 0) {
        throw new Error('Recipient has no accounts in the target bank');
      }

      const toAccount = toBank.getAccount(toUserAccounts[0]); // Use first account
      
      // Perform the transfers from multiple accounts
      for (const { account, amount: transferAmount } of accountsToUse) {
        account.withdraw(transferAmount);
        toAccount.deposit(transferAmount);
      }
    } else {
      // Transfer within same bank
      const toUserAccounts = toUser.getAccountsInBank(this.id);
      if (toUserAccounts.length === 0) {
        throw new Error('Recipient has no accounts in this bank');
      }

      const toAccount = this.getAccount(toUserAccounts[0]); // Use first account
      
      // Perform the transfers from multiple accounts
      for (const { account, amount: transferAmount } of accountsToUse) {
        account.withdraw(transferAmount);
        toAccount.deposit(transferAmount);
      }
    }
  }
}

export default Bank; 