import { Request, Response } from 'express';
import { Container } from 'typedi';
import { VoteService, MemberService } from '../services';

class VoteController {
  constructor(
    private voteService: VoteService,
    private memberService: MemberService,
  ) {}

  private getSession(request: Request, response: Response) {
    const { apitoken } = request.headers;
    const session = this.memberService.decodeMemberToken(<string>apitoken);
    if (!session) {
      response.status(400).json({ error: 'Invalid or missing token.' });
      return null;
    }
    return session;
  }

  public async getPolls(request: Request, response: Response): Promise<void> {
    const session = this.getSession(request, response);
    const { placeId } = request.params;
    if (!session) return;
    try {
      const polls = await this.voteService.getPolls(Number.parseInt(placeId));
      response.status(200).json({ polls });
    } catch (error) {
      response.status(400).json({ error: 'Failed to fetch polls.' });
    }
  }

  public async getPollById(request: Request, response: Response): Promise<void> {
    const session = this.getSession(request, response);
    if (!session) return;
    const pollId = Number.parseInt(request.params.id);
    try {
      const poll = await this.voteService.getPollById(pollId);
      response.status(200).json({ poll });
    } catch (error) {
      response.status(400).json({ error: 'Failed to fetch poll.' });
    }
  }

  public async createPoll(request: Request, response: Response): Promise<void> {
    const session = this.getSession(request, response);
    if (!session) return;
    const { id } = session;
    const { memberId, placeId, question, choices } = request.body;
    if (!question || !Array.isArray(choices) || choices.length < 2) {
      response.status(400).json({ error: 'Invalid poll data.' });
      return;
    }
    try {
      const poll = await this.voteService.createPoll(memberId, placeId, question, choices);
      response.status(201).json({ poll });
    } catch (error) {
      response.status(400).json({ error: 'Failed to create poll.' });
    }
  }

  public async castVote(request: Request, response: Response): Promise<void> {
    const session = this.getSession(request, response);
    if (!session) return;
    const { id } = session;
    const pollId = Number.parseInt(request.params.id);
    const { option } = request.body;
    if (typeof option === 'undefined') {
      response.status(400).json({ error: 'Option is required.' });
      return;
    }
    try {
      const result = await this.voteService.castVote(id, pollId, option);
      response.status(200).json({ result });
    } catch (error) {
      response.status(400).json({ error: 'Failed to cast vote.' });
    }
  }

  public async deletePoll(request: Request, response: Response): Promise<void> {
    const session = this.getSession(request, response);
    if (!session) return;
    const { id } = session;
    const pollId = Number.parseInt(request.params.id);
    // Optional: check if user is admin/creator of poll
    try {
      const deleted = await this.voteService.deletePoll(id, pollId);
      response.status(200).json({ deleted });
    } catch (error) {
      response.status(400).json({ error: 'Failed to delete poll.' });
    }
  }
}

const voteService = Container.get(VoteService);
const memberService = Container.get(MemberService);

export const voteController = new VoteController(voteService, memberService);
