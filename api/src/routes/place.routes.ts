import Router, {request, response} from 'express';

import {placeController} from '../controllers';

const placeRoutes = Router();

placeRoutes.get('/:placeId/object_instance',
  (request, response) => placeController.getPlaceObjects(request, response));
placeRoutes.get('/:slug',
  (request, response) => placeController.getPlace(request, response));
placeRoutes.get('/can_admin/:slug/:id?',
  (request, response) => placeController.canAdmin(request, response));
placeRoutes.get('/can_manage_access/:slug/:id?',
  (request, response) => placeController.canManageAccess(request, response));
placeRoutes.get('/getAccessInfo/:slug/:id?',
  (request, response) => placeController.getAccessInfoByUsername(request, response));
placeRoutes.post('/postAccessInfo/:slug/:id?',
  (request, response) => placeController.postAccessInfo(request, response));
/**
 * start of future api routes
 *
placeRoutes.post('/:slug/postAccessInfo',
  (request, response) => placeController.postAccessInfo(request, response));
 *
 * end of future api routes
*/
export { placeRoutes };
