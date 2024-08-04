<template>
  <div>

    <button class="btn-ui"
            v-on:click="opener('#/information/'
              + $store.data.place.type
              + '/'
              + $store.data.place.id)">Information</button>
    <span v-if="$store.data.place.slug === 'employment'">
      <button class="btn-ui"
              v-on:click="opener('#/messageboard/' + $store.data.place.id)">Job Offers</button>
    </span>
    <span v-else-if="$store.data.place.type === 'shop'">
      <button class="btn-ui" v-on:click="opener(`#/inbox/${mallId.data.place.id}`)">Mall Inbox</button>
      <button class="btn-ui" v-on:click="opener(`#/messageboard/${mallId.data.place.id}`)">Mall Messages</button>
    </span>
    <span v-else>
    <button class="btn-ui"
            v-on:click="opener('#/inbox/' + $store.data.place.id)">Inbox</button>
    <button class="btn-ui"
            v-on:click="opener('#/messageboard/' + $store.data.place.id)">Messages</button>
    </span>
    <br />
    <div v-if="$store.data.place.slug === 'mall'">
    <router-link 
      :to="{ name: 'mall-shop' }"
      class="btn-ui">For Sale</router-link>
    <router-link 
      :to="{ name: 'mall-upload' }"
      class="btn-ui">Upload</router-link>
    </div>
    <div v-if="canAdmin">
      <div v-if="isColony">
        <span href=""
              class="btn-ui">Message to All</span>
        <span href=""
              class="btn-ui">Inbox to All</span>
      </div>
      <span href=""
            class="btn-ui">Update</span>
      <router-link :to="{ name: 'worldAccessRights' }"
                   class="btn-ui">Access Rights</router-link>
      <br />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "WorldBrowserTools",
  data: () => {
    return {
      adminCheck: false,
      loaded: false,
      canAdmin: false,
      data: null,
      mallId: null,
      reference: null,
      isColony: false,
    };
  },
  methods: {
    async getMallId(){
      this.mallId = await this.$http.get('/place/mall');
    },
    async checkAdmin() {
      if (this.$store.data.place.type === "public") {
        this.reference = `/place/can_admin/${
          this.$store.data.place.slug
        }/${
          this.$store.data.place.id
        }`;
        this.isColony = false;
      } else if (this.$store.data.place.type === "shop") {
        this.reference = "/place/can_admin/mall";
        this.isColony = false;
      } else {
        this.reference = `/colony/${this.$store.data.place.id}/can_admin`;
        this.isColony = true;
      }
      try {
        await this.$http.get(this.reference).then((response) => {
          this.canAdmin = response.data.result;
        });
        //this.canAdmin = true;
      } catch (error) {
        console.log(error);
        this.canAdmin = false;
      }
    },
    async opener(link) {
      window.open(link, "targetWindow", "height=650,width=800,menubar=no,status=no");
    },
  },
  mounted() {
    this.checkAdmin();
    this.getMallId();
  },
  watch: {
    async $route(to, from) {
      console.log("Place Change");
      await this.checkAdmin();
      this.loaded = true;
    },
  },
});
</script>
