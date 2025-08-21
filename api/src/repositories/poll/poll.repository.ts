import { Service } from 'typedi';
import { knex } from '../../db';

@Service()
export class PollRepository {
  /** Get all polls */
  public async getPolls(): Promise<any[]> {
    return await knex('polls').select('*');
  }

  /** Get a poll by its ID */
  public async getPollById(pollId: number): Promise<any> {
    const poll = await knex('polls').where({ id: pollId }).first();
    if (!poll) return null;
    poll.options = await knex('poll_options').where({ poll_id: pollId }).select('id', 'option_text');
    return poll;
  }

  /** Create a new poll with options */
  public async createPoll(memberId: number, question: string, options: string[]): Promise<any> {
    return await knex.transaction(async trx => {
      const [pollId] = await trx('polls').insert({
        member_id: memberId,
        question,
        created_at: new Date()
      }).returning('id');
      const pollOptions = options.map(option => ({
        poll_id: pollId,
        option_text: option
      }));
      await trx('poll_options').insert(pollOptions);
      return await this.getPollById(pollId);
    });
  }

  /** Delete a poll (and its options) */
  public async deletePoll(memberId: number, pollId: number): Promise<any> {
    return await knex.transaction(async trx => {
      // Optionally, check if the member is the owner
      const poll = await trx('polls').where({ id: pollId, member_id: memberId }).first();
      if (!poll) return null;
      await trx('poll_options').where({ poll_id: pollId }).del();
      await trx('polls').where({ id: pollId }).del();
      return poll;
    });
  }
}