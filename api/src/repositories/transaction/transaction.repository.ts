import { Service } from 'typedi';

import { Db } from '../../db/db.class';
import { Transaction, TransactionReason, Wallet } from '../../types/models';

/** Repository for creating/interacting with transaction/wallet data in the database. */
@Service()
export class TransactionRepository {
  constructor(private db: Db) {}

  /**
   * Applies the given amount to the balance for the wallet with the given id, and creates
   * a transaction record.
   * @param walletId id of recipient wallet
   * @param amount amount transacted
   * @returns promise resolving in the created transaction object, or rejecting on error
   */
  public async createDailyCreditTransaction(
    walletId: number,
    amount: number,
  ): Promise<Transaction> {
    return await this.db.knex.transaction(async trx => {
      const wallet = await trx<Wallet>('wallet').where({ id: walletId }).first();
      await trx<Wallet>('wallet')
        .where({ id: walletId })
        .update({ balance: wallet.balance + amount });
      const [transactionId] = await trx<Transaction>('transaction').insert({
        amount,
        reason: TransactionReason.DailyCredit,
        recipient_wallet_id: walletId,
      });
      return this.find({ id: transactionId });
    });
  }

  /**
   * Finds a transaction with the given search parameters if one exists.
   * @param transactionSearchParams object containing properties of a transaction for searching on
   * @returns promise resolving in the found transaction object, or rejecting on error
   */
  public async find(transactionSearchParams: Partial<Transaction>): Promise<Transaction> {
    const [transaction] = await this.db.transaction.where(transactionSearchParams);
    return transaction;
  }

  /**
   * Deducts the given amount from the balance for the wallet with the given id, and creates
   * a transaction record.
   * @param walletId id of recipient wallet
   * @param amount amount transacted
   * @returns promise resolving in the created transaction object, or rejecting on error
   */
  public async createHomePurchaseTransaction(
    walletId: number,
    amount: number,
  ): Promise<Transaction> {
    return await this.db.knex.transaction(async trx => {
      const wallet = await trx<Wallet>('wallet').where({ id: walletId }).first();
      await trx<Wallet>('wallet')
        .where({ id: walletId })
        .update({ balance: wallet.balance - amount });
      const [transactionId] = await trx<Transaction>('transaction').insert({
        amount,
        reason: TransactionReason.HomePurchase,
        sender_wallet_id: walletId,
      });
      return this.find({ id: transactionId });
    });
  }

  /**
   * Applies the given amount to the balance for the wallet with the given id, and creates
   * a transaction record.
   * @param walletId id of recipient wallet
   * @param amount amount transacted
   * @returns promise resolving in the created transaction object, or rejecting on error
   */
  public async createHomeRefundTransaction(walletId: number, amount: number): Promise<Transaction> {
    return await this.db.knex.transaction(async trx => {
      const wallet = await trx<Wallet>('wallet').where({ id: walletId }).first();
      await trx<Wallet>('wallet')
        .where({ id: walletId })
        .update({ balance: wallet.balance + amount });
      const [transactionId] = await trx<Transaction>('transaction').insert({
        amount,
        reason: TransactionReason.HomeRefund,
        recipient_wallet_id: walletId,
      });
      return this.find({ id: transactionId });
    });
  }
  public async createWeeklyRoleCreditTransaction(
    walletId: number,
    amount: number,
    roleId: number,
  ): Promise<Transaction> {
    return await this.db.knex.transaction(async trx => {
      const wallet = await trx<Wallet>('wallet').where({ id: walletId }).first();
      await trx<Wallet>('wallet')
        .where({ id: walletId })
        .update({ balance: wallet.balance + amount });
      const [transactionId] = await trx<Transaction>('transaction').insert({
        amount,
        reason: `${TransactionReason.WeeklyCredit} for ${roleId}`,
        recipient_wallet_id: walletId,
      });
      return this.find({ id: transactionId });
    });
  }
  public async createSystemCreditTransaction(
    walletId: number,
    amount: number,
  ): Promise<Transaction> {
    return await this.db.knex.transaction(async trx => {
      const wallet = await trx<Wallet>('wallet').where({ id: walletId }).first();
      await trx<Wallet>('wallet')
        .where({ id: walletId })
        .update({ balance: wallet.balance + amount });
      const [transactionId] = await trx<Transaction>('transaction').insert({
        amount,
        reason: TransactionReason.SystemToMember,
        recipient_wallet_id: walletId,
      });
      return this.find({ id: transactionId });
    });
  }

  public async createObjectUploadTransaction(
    walletId: number,
    amount: number,
  ): Promise<Transaction> {
    return await this.db.knex.transaction(async trx => {
      const wallet = await trx<Wallet>('wallet').where({ id: walletId }).first();
      await trx<Wallet>('wallet')
        .where({ id: walletId })
        .update({ balance: wallet.balance - amount });
      const [transactionId] = await trx<Transaction>('transaction').insert({
        amount,
        reason: TransactionReason.ObjectUpload,
        sender_wallet_id: walletId,
      });
      return this.find({ id: transactionId });
    });
  }

  public async createObjectRestockTransaction(
    walletId: number,
    amount: number,
  ): Promise<Transaction> {
    return await this.db.knex.transaction(async trx => {
      const wallet = await trx<Wallet>('wallet').where({ id: walletId }).first();
      await trx<Wallet>('wallet')
        .where({ id: walletId })
        .update({ balance: wallet.balance - amount });
      const [transactionId] = await trx<Transaction>('transaction').insert({
        amount,
        reason: TransactionReason.ObjectRestock,
        sender_wallet_id: walletId,
      });
      return this.find({ id: transactionId });
    });
  }

  public async createObjectUploadRefundTransaction(
    walletId: number,
    amount: number,
  ): Promise<Transaction> {
    return await this.db.knex.transaction(async trx => {
      const wallet = await trx<Wallet>('wallet').where({ id: walletId }).first();
      await trx<Wallet>('wallet')
        .where({ id: walletId })
        .update({ balance: wallet.balance + amount });
      const [transactionId] = await trx<Transaction>('transaction').insert({
        amount,
        reason: TransactionReason.ObjectUploadRefund,
        recipient_wallet_id: walletId,
      });
      return this.find({ id: transactionId });
    });
  }

  public async createUnsoldObjectRefundTransaction(
    walletId: number,
    amount: number,
  ): Promise<Transaction> {
    return await this.db.knex.transaction(async trx => {
      const wallet = await trx<Wallet>('wallet').where({ id: walletId }).first();
      await trx<Wallet>('wallet')
        .where({ id: walletId })
        .update({ balance: wallet.balance + amount });
      const [transactionId] = await trx<Transaction>('transaction').insert({
        amount,
        reason: TransactionReason.ObjectUnsoldInstancesRefund,
        recipient_wallet_id: walletId,
      });
      return this.find({ id: transactionId });
    });
  }

  public async createObjectPurchaseTransaction(
    walletId: number,
    amount: number,
  ): Promise<Transaction> {
    return await this.db.knex.transaction(async trx => {
      const wallet = await trx<Wallet>('wallet').where({ id: walletId }).first();
      await trx<Wallet>('wallet')
        .where({ id: walletId })
        .update({ balance: wallet.balance - amount });
      const [transactionId] = await trx<Transaction>('transaction').insert({
        amount,
        reason: TransactionReason.ObjectPurchase,
        sender_wallet_id: walletId,
      });
      return this.find({ id: transactionId });
    });
  }

  public async createObjectProfitTransaction(
    walletId: number,
    amount: number,
  ): Promise<Transaction> {
    return await this.db.knex.transaction(async trx => {
      const wallet = await trx<Wallet>('wallet').where({ id: walletId }).first();
      await trx<Wallet>('wallet')
        .where({ id: walletId })
        .update({ balance: wallet.balance + amount });
      const [transactionId] = await trx<Transaction>('transaction').insert({
        amount,
        reason: TransactionReason.ObjectProfit,
        recipient_wallet_id: walletId,
      });
      return this.find({ id: transactionId });
    });
  }

  public async createObjectSellTransaction(
    buyerId: number,
    sellerId: number,
    amount: number,
  ): Promise<Transaction> {
    return await this.db.knex.transaction(async trx => {
      const sellerWallet = await trx<Wallet>('wallet').where({ id: sellerId }).first();
      const buyerWallet = await trx<Wallet>('wallet').where({ id: buyerId }).first();
      await trx<Wallet>('wallet')
        .where({ id: sellerId })
        .update({ balance: sellerWallet.balance + amount });
      await trx<Wallet>('wallet')
        .where({ id: buyerId })
        .update({ balance: buyerWallet.balance - amount });
      const [transactionId] = await trx<Transaction>('transaction').insert({
        amount,
        reason: TransactionReason.ObjectSell,
        recipient_wallet_id: sellerId,
        sender_wallet_id: buyerId,
      });
      return this.find({ id: transactionId });
    });
  }

  public async getTransactions(type: string, limit: number, offset: number): Promise<any> {
    return this.db.knex
      .select(
        'id',
        'created_at',
        'amount',
        'recipient_wallet_id',
        'sender_wallet_id',
        'reason',
      )
      .from('transaction')
      .where('reason', type)
      .limit(limit)
      .offset(offset)
      .orderBy('id', 'DESC');
    ;
  }

  public async getTransactionsByWalletId(id: number, limit: number, offset: number): Promise<any> {
    return this.db.knex
      .select(
        'id',
        'created_at',
        'amount',
        'recipient_wallet_id',
        'sender_wallet_id',
        'reason',
      )
      .from('transaction')
      .where('recipient_wallet_id', id)
      .orWhere('sender_wallet_id', id)
      .limit(limit)
      .offset(offset)
      .orderBy('id', 'DESC');
    ;
  }

  public async getLatestTransactions(time: Date): Promise<any> {
    return this.db.knex
      .select('transaction.*')
      .from('transaction')
      .where('created_at', '>=', time)
      .limit(30)
      .orderBy('transaction.id', 'DESC');
    ;
  }

  public async getTotal( type: string): Promise<any> {
    return this.db.knex
      .count('id as count')
      .from('transaction')
      .where('reason', type);
  }

  public async getWalletTotal( id: number): Promise<any> {
    return this.db.knex
      .count('id as count')
      .from('transaction')
      .where('recipient_wallet_id', id)
      .orWhere('sender_wallet_id', id);
  }
}
