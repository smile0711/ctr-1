import { VoteService } from './vote.service';
import { PollRepository, VoteRepository } from '../../repositories';

jest.mock('../../repositories');

describe('VoteService', () => {
  let voteService: VoteService;
  let pollRepository: jest.Mocked<PollRepository>;
  let voteRepository: jest.Mocked<VoteRepository>;

  beforeEach(() => {
    pollRepository = new PollRepository() as jest.Mocked<PollRepository>;
    voteRepository = new VoteRepository() as jest.Mocked<VoteRepository>;
    voteService = new VoteService(pollRepository, voteRepository);
  });

  describe('getPolls', () => {
    it('should return all polls', async () => {
      const polls = [{ id: 1, question: 'Q1' }];
      pollRepository.getPolls.mockResolvedValue(polls);

      const result = await voteService.getPolls();
      expect(result).toBe(polls);
      expect(pollRepository.getPolls).toHaveBeenCalled();
    });
  });

  describe('getPollById', () => {
    it('should return poll by id', async () => {
      const poll = { id: 1, question: 'Q1' };
      pollRepository.getPollById.mockResolvedValue(poll);

      const result = await voteService.getPollById(1);
      expect(result).toBe(poll);
      expect(pollRepository.getPollById).toHaveBeenCalledWith(1);
    });
  });

  describe('createPoll', () => {
    it('should create a new poll', async () => {
      const poll = { id: 1, question: 'Q1', options: ['A', 'B'] };
      pollRepository.createPoll.mockResolvedValue(poll);

      const result = await voteService.createPoll(2, 'Q1', ['A', 'B']);
      expect(result).toBe(poll);
      expect(pollRepository.createPoll).toHaveBeenCalledWith(2, 'Q1', ['A', 'B']);
    });
  });

  describe('castVote', () => {
    it('should cast a vote', async () => {
      const vote = { id: 1, memberId: 2, pollId: 3, option: 1 };
      voteRepository.castVote.mockResolvedValue(vote);

      const result = await voteService.castVote(2, 3, 1);
      expect(result).toBe(vote);
      expect(voteRepository.castVote).toHaveBeenCalledWith(2, 3, 1);
    });
  });

  describe('deletePoll', () => {
    it('should delete a poll', async () => {
      pollRepository.deletePoll.mockResolvedValue({ success: true });

      const result = await voteService.deletePoll(2, 3);
      expect(result).toEqual({ success: true });
      expect(pollRepository.deletePoll).toHaveBeenCalledWith(2, 3);
    });
  });

  describe('getVotesByPollId', () => {
    it('should get all votes for a poll', async () => {
      const votes = [{ id: 1, pollId: 3, memberId: 2, option: 1 }];
      voteRepository.getVotesByPollId.mockResolvedValue(votes);

      const result = await voteService.getVotesByPollId(3);
      expect(result).toBe(votes);
      expect(voteRepository.getVotesByPollId).toHaveBeenCalledWith(3);
    });
  });
});

// We recommend installing an extension to run jest tests.