import Router from 'express';

import { voteController } from '../controllers';

const voteRoutes = Router();

// Get all polls
voteRoutes.get('/polls', (req, res) => voteController.getPolls(req, res));

// Get a single poll by ID
voteRoutes.get('/polls/:id', (req, res) => voteController.getPollById(req, res));

// Create a new poll
voteRoutes.post('/polls', (req, res) => voteController.createPoll(req, res));

// Cast a vote on a poll
voteRoutes.post('/polls/:id/vote', (req, res) => voteController.castVote(req, res));

// (Optional) Delete a poll
voteRoutes.delete('/polls/:id', (req, res) => voteController.deletePoll(req, res));

export { voteRoutes };
