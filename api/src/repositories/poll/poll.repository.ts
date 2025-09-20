import { Service } from 'typedi';
import { knex } from '../../db';

export interface PollChoice {
  id?: number;
  poll_id?: number;
  text: string;
}

export interface Poll {
  id?: number;
  placeId?: number;
  memberId?: number;
  question: string;
  created_at?: Date;
  updated_at?: Date;
  choices?: PollChoice[];
}

@Service()
export class PollRepository {
  private pollTable = 'polls';
  private choiceTable = 'poll_choices';

  public async createPoll(poll: Poll, choices: PollChoice[]): Promise<Poll> {
    const [pollId] = await knex(this.pollTable)
      .insert({ question: poll.question,  })
      .returning('id');
    const poll_id = typeof pollId === 'object' ? pollId.id : pollId;

    const choicesToInsert = choices.map(choice => ({
      poll_id,
      text: choice.text,
    }));
    await knex(this.choiceTable).insert(choicesToInsert);

    const createdPoll = await this.getPollById(poll_id);
    return createdPoll!;
  }

  public async editPoll(pollId: number, poll: Poll, choices: PollChoice[]): Promise<Poll | null> {
    await knex(this.pollTable)
      .where({ id: pollId })
      .update({ question: poll.question, updated_at: knex.fn.now() });

    // Remove existing choices
    await knex(this.choiceTable).where({ poll_id: pollId }).del();

    // Insert new choices
    const choicesToInsert = choices.map(choice => ({
      poll_id: pollId,
      text: choice.text,
    }));
    await knex(this.choiceTable).insert(choicesToInsert);

    const updatedPoll = await this.getPollById(pollId);
    return updatedPoll;
  }

  public async deletePoll(pollId: number): Promise<void> {
    await knex(this.choiceTable).where({ poll_id: pollId }).del();
    await knex(this.pollTable).where({ id: pollId }).del();
  }

  public async getPollById(pollId: number): Promise<Poll | null> {
    const poll = await knex(this.pollTable).where({ id: pollId }).first();
    if (!poll) return null;
    const choices: PollChoice[] = await knex(this.choiceTable)
      .where({ poll_id: pollId })
      .select('id', 'text');
    return {
      id: poll.id,
      question: poll.question,
      created_at: poll.created_at,
      updated_at: poll.updated_at,
      choices,
    };
  }
  public async getPollsByPlaceId(placeId: number): Promise<Poll[]> {
    const polls = await knex(this.pollTable)
      .where({ place_id: placeId })
      .select('*');

    const pollIds = polls.map(p => p.id);

    const choices = await knex(this.choiceTable)
      .whereIn('poll_id', pollIds)
      .select('id', 'poll_id', 'text');

    return polls.map(poll => ({
      id: Number(poll.id),
      question: poll.question.toString(),
      created_at: new Date(poll.created_at),
      updated_at: new Date(poll.updated_at),
    }));
  }
}
