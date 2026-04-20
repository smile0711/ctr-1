import api from "../api";
import { AppStore } from "../appStore";
import { VueWithCustomFilters } from '../filters';
import { SocketManager } from "../socket";

import { RouteLocationNormalizedLoaded, Router } from 'vue-router';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties extends VueWithCustomFilters {
    $http: typeof api,
    $socket: SocketManager,
    $store: AppStore,
    $route: RouteLocationNormalizedLoaded,
    $router: Router,
  }
}