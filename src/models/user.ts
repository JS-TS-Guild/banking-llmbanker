import GlobalRegistry from '@/services/GlobalRegistry';
import { UserId, BankAccountId } from '@/types/Common';

class User {
  private id: UserId;
  private name: string;
  private accountIds: BankAccountId[];

  constructor(name: string, accountIds: BankAccountId[] = []) {
    this.id = GlobalRegistry.generateId();
    this.name = name;
    this.accountIds = accountIds;
    GlobalRegistry.registerUser(this);
  }

  static create(name: string, accountIds: BankAccountId[] = []): User {
    return new User(name, accountIds);
  }

  getId(): UserId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getAccountIds(): BankAccountId[] {
    return [...this.accountIds]; // Return a copy to prevent external modification
  }

  addAccount(accountId: BankAccountId): void {
    if (!this.accountIds.includes(accountId)) {
      this.accountIds.push(accountId);
    }
  }

  removeAccount(accountId: BankAccountId): void {
    const index = this.accountIds.indexOf(accountId);
    if (index > -1) {
      this.accountIds.splice(index, 1);
    }
  }

  getAccountsInBank(bankId: string): BankAccountId[] {
    return this.accountIds.filter(accountId => {
      const account = GlobalRegistry.getAccount(accountId);
      return account && account.getBankId() === bankId;
    });
  }
}

export default User; 