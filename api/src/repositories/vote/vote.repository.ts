import { Service, Inject } from 'typedi';
import { Knex } from 'knex';

// filepath: c:/Users/smile/Documents/ctr/api/src/repositories/vote/vote.repository.ts

@Service()
export class VoteRepository {
  @Inject('db')
  private db!: Knex;

  /** Cast a vote for a poll option */
  public async castVote(
    memberId: number,
    pollId: number,
    option: number,
  ): Promise<any> {
    // Prevent double voting by the same member for the same poll
    const existing = await this.db('votes')
      .where({ member_id: memberId, poll_id: pollId })
      .first();

    if (existing) {
      throw new Error('Member has already voted in this poll.');
    }

    const [vote] = await this.db('votes')
      .insert({
        member_id: memberId,
        poll_id: pollId,
        option: option,
        created_at: this.db.fn.now(),
      })
      .returning('*');

    return vote;
  }

  /** Get all votes for a poll */
  public async getVotesByPollId(pollId: number): Promise<any[]> {
    return await this.db('votes')
      .select('id', 'member_id', 'option', 'created_at')
      .where({ poll_id: pollId });
  }
}