import { Service } from 'typedi';
import { PollRepository, VoteRepository } from '../../repositories';

@Service()
export class VoteService {
  constructor(
    private pollRepository: PollRepository,
    private voteRepository: VoteRepository,
  ) {}

  /** Get all polls */
  public async getPolls(placeId: number): Promise<any> {
    return await this.pollRepository.getPollsByPlaceId(placeId);
  }

  /** Get a poll by its ID, including votes if needed */
  public async getPollById(pollId: number): Promise<any> {
    const poll = await this.pollRepository.getPollById(pollId);
    // Optionally, fetch votes for this poll
    // const votes = await this.voteRepository.getVotesByPollId(pollId);
    // return { ...poll, votes };
    return poll;
  }

  /** Create a new poll */
  public async createPoll(
    memberId: number,
    placeId: number,
    question: string,
    choices: any[],
  ): Promise<any> {
    return await this.pollRepository.createPoll({memberId, placeId, question}, choices);
  }

  /** Cast a vote for a poll option */
  public async castVote(
    memberId: number,
    pollId: number,
    option: number,
  ): Promise<any> {
    return await this.voteRepository.castVote(memberId, pollId, option);
  }

  /** Delete a poll */
  public async deletePoll(
    memberId: number,
    pollId: number,
  ): Promise<any> {
    return await this.pollRepository.deletePoll(pollId);
  }

  /** Optionally, get all votes for a poll */
  public async getVotesByPollId(pollId: number): Promise<any> {
    return await this.voteRepository.getVotesByPollId(pollId);
  }
}
