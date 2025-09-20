import { Service, Inject } from 'typedi';
import { knex } from '../../db';

@Service()
export class VoteRepository {

  /** Cast a vote for a poll option */
  public async castVote(
    memberId: number,
    pollId: number,
    option: number,
  ): Promise<any> {
    // Prevent double voting by the same member for the same poll
    const existing = await knex('votes')
      .where({ member_id: memberId, poll_id: pollId })
      .first();

    if (existing) {
      throw new Error('Member has already voted in this poll.');
    }

    const [vote] = await knex('votes')
      .insert({
        member_id: memberId,
        poll_id: pollId,
        option: option,
        created_at: knex.fn.now(),
      })
      .returning('*');

    return vote;
  }

  /** Get all votes for a poll */
  public async getVotesByPollId(pollId: number): Promise<any[]> {
    return await knex('votes')
      .select('id', 'member_id', 'option', 'created_at')
      .where({ poll_id: pollId });
  }
}