import Router, {request, response} from 'express';

import {placeController} from '../controllers';

const placeRoutes = Router();

placeRoutes.get('/:placeId/object_instance',
  (request, response) => placeController.getPlaceObjects(request, response));
placeRoutes.get('/:slug',
  (request, response) => placeController.getPlace(request, response));
placeRoutes.get('/can_admin/:slug/:id?',
  (request, response) => placeController.canAdmin(request, response));
/**
 * start of future api routes
 *
placeRoutes.get('/:slug/can_manage_access',
  (request, response) => placeController.canManageAccess(request, response));
placeRoutes.get('/:slug/getAccessInfo',
  (request, response) => placeController.getAccessInfoByUsername(request, response));
placeRoutes.post('/:slug/postAccessInfo',
  (request, response) => placeController.postAccessInfo(request, response));
 *
 * end of future api routes
*/
export { placeRoutes };
