import Router from 'express';
import {clubController} from '../controllers';

const clubRoutes = Router();

clubRoutes.post('/create', (request, response) =>
  clubController.createClub(request, response));
clubRoutes.post('/delete', (request, response) =>
  clubController.deleteClub(request, response));
clubRoutes.post('/update', (request, response) =>
  clubController.updateClub(request, response));
clubRoutes.get('/search', (request, response) =>
  clubController.searchClubs(request, response));

export {clubRoutes};