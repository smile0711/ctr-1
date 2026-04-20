import { createApp } from "vue";
import * as Vue from "vue";

// @ts-ignore
if (Vue.configureCompat) {
  // @ts-ignore
  Vue.configureCompat({ WATCH_ARRAY: false });
}
import VueGtag from "vue-gtag";

import App from "./App.vue";
import api from "./api";
import appStore, {User} from "./appStore";
import * as filters from "./helpers/fiters";
import router from "./routes";
import socket from "./socket";
import "./assets/index.scss";

const app = createApp(App);

app.config.globalProperties.$filters = {};
// register global utilities/filters
Object.keys(filters).forEach(key => {
  // @ts-ignore
  app.config.globalProperties.$filters[key] = filters[key as keyof typeof filters];
});
app.config.globalProperties.$http = api;
app.config.globalProperties.$store = appStore;
app.config.globalProperties.$socket = socket;

document.querySelector("html")!.classList.add("dark");

router.beforeEach(async (to, from, next) => {
  if (to.meta.title) {
    document.title = `${ to.meta.title } - Cybertown`;
  } else {
    document.title = "Cybertown";
  }

  let redirectUrl: any = null;

  try {
    if (to.fullPath.includes("/place/")) {
      const response = await api.get<any>(`/place/${to.params.id}`);
      const Data = response.data;
      const place = {...Data.place};
      appStore.methods.setPlace(place);
    } else if (to.fullPath.includes("/club/")) {
      const response = await api.get<any>(`/place/by_id/${to.params.id}`);
      const Data = response.data;
      const memRes = await api.get<any>(`/club/ismember?clubId=${Data.place.id}`);
      if (!memRes.data.isMember) {
        redirectUrl = `/clubdoor/${Data.place.id}`;
      }
      const place = {
        ...Data.place,
        assets_dir: "club/vrml/",
        world_filename: "vrml.wrl",
      };
      appStore.methods.setPlace(place);
    } else if (to.fullPath.includes("/inbox/") || to.fullPath.includes("/messageboard/")) {
      const response = await api.get<any>(`/place/by_id/${to.params.place_id}`);
      const Data = response.data;
      if (Data.place.type === 'club' && Data.place.private) {
        const memRes = await api.get<any>(`/club/ismember?clubId=${Data.place.id}`);
        if (!memRes.data.isMember) {
          const checkUrl = to.fullPath.includes("/messageboard/") ? `/messageboard/getadmininfo/` : `/inbox/getadmininfo/`;
          const adminRes = await api.post<any>(checkUrl, { place_id: Data.place.id, type: Data.place.type });
          if (!adminRes.data.admin) {
            redirectUrl = `/clubdoor/${Data.place.id}`;
          }
        }
      }
    } else if (to.fullPath.includes("/clubdoor/")) {
      const response = await api.get<any>(`/place/by_id/${to.params.id}`);
      appStore.methods.setPlace(response.data.place);
    } else if (to.fullPath.includes("/home/")){
      const response = await api.get<any>(`/home/${ to.params.username }`);
      const Data = response.data;
      const place = {
        ...Data.homeData,
        assets_dir: Data.homeDesignData ? (`${ Data.homeDesignData.id  }/`) : null,
        world_filename: "home.wrl",
        slug: "home",
        block: Data.blockData,
      };
      appStore.methods.setPlace(place);
    }
  } catch (err) {
    console.error("Router guard API error:", err);
  }

  // If a place redirect triggers, halt further API calls and immediately go there
  if (redirectUrl) {
    return next(redirectUrl);
  }

  // Session Validation
  if (!["login", "logout", "signup", "forgot", "password_reset",
    "about", "privacypolicy", "rulesandregulations", "constitution", "banned"]
    .includes(to.name as string)) {
    try {
      const response = await api.get<any>("/member/session");
      const { user, banInfo, banned } = response.data;
      
      if (banned) {
        if (
          banInfo.type === "jail" &&
          (to.fullPath.includes("/messageboard/") ||
          to.fullPath.includes("/inbox/") ||
          to.fullPath.includes("/information/"))
        ) {
          return next("/restricted");
        } else if (to.fullPath === "/restricted") {
          return next();
        } else if (to.fullPath !== "/place/jail" && banInfo.type === "jail") {
          const jailRes = await api.get<any>("/place/jail");
          appStore.methods.setPlace({...jailRes.data.place});
          return next("/place/jail");
        } else if (to.fullPath === "/place/jail") {
          return next();
        } else {
          appStore.methods.destroySession();
          return next({
            name: "banned",
            params: {
              reason: banInfo.reason,
              enddate: banInfo.end_date,
            },
          });
        }
      }
      appStore.methods.setUser(user);
      appStore.data.isUser = true;
      return next();
    } catch (e) {
      appStore.methods.destroySession();
      if (to.name !== "home") {
        return next({
          name: "login",
          query: { redirect: to.fullPath },
        });
      } else {
        return next();
      }
    }
  } else {
    return next();
  }
});

app.use(VueGtag, {
  pageTrackerTemplate(to: any) {
    return {
      page_title: document.title,
      page_path: to.path,
    };
  },
  config: { id: "G-BCMREM3LDH" },
}, router);

app.use(router);
app.mount("#app");
