import Bank from '@/models/bank';
import User from '@/models/user';
import BankAccount from '@/models/bank-account';
import { UserId, BankAccountId } from '@/types/Common';

class TransactionService {
  static transfer(
    fromUserId: UserId,
    toUserId: UserId,
    amount: number,
    fromBankId?: string,
    toBankId?: string
  ): void {
    // This service can be used for more complex transaction logic
    // For now, it delegates to the bank's send method
    if (!fromBankId) {
      throw new Error('Source bank ID is required');
    }

    const bank = Bank.create(); // This would need to be retrieved from registry
    bank.send(fromUserId, toUserId, amount, toBankId);
  }

  static validateTransfer(
    fromUserId: UserId,
    toUserId: UserId,
    amount: number
  ): boolean {
    // Validate transfer parameters
    if (amount <= 0) {
      return false;
    }
    
    // Additional validation logic can be added here
    return true;
  }
}

export default TransactionService; 