import Router, {request, response} from 'express';

import {placeController} from '../controllers';

const placeRoutes = Router();

placeRoutes.get('/:slug/can_admin',
  (request, response) => placeController.canAdmin(request, response));
placeRoutes.get('/:placeId/object_instance',
  (request, response) => placeController.getPlaceObjects(request, response));
placeRoutes.get('/:slug',
  (request, response) => placeController.getPlace(request, response));

export { placeRoutes };
