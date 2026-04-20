<template>
  <section :class="{ 'modal-root': modal.component }">
    <transition name="modal">
      <component 
        v-if="modal"
        :is="modal.component"
        v-bind="modal.props"
        v-bind:close="modal.close"
        v-bind:dismiss="modal.dismiss"
        :class="{ 'd-block': modal.component }"
      />
    </transition>
  </section>
</template>

<script lang="ts">
import { defineComponent, markRaw } from "vue";

import ModalService from './services/ModalService.vue';
import Modal from './Modal.vue';

export default defineComponent({
  components: { Modal },
  data() {
    return {
      modal: {} as any,
    }
  },
  created() {
    ModalService.$on('open', ({ component, props, resolve, reject }: any) => {
      this.modal = {
        component: markRaw(component),
        props,
        close: (value: any) => {
          this.modal = {};
          resolve(value);
        },
        dismiss: reason => {
          this.modal = {};
          reject(reason);
        },
      };
    });
  }
});
</script>

<style scoped>
.modal-root {
  position: fixed;
  top: 0;
  z-index: 100;
  width: 100vw;
  height: 100vh;
  background-color: rgba(1, 1, 1, 0.2);
}
.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease-out;
}
.modal-enter-from,
.modal-leave-to {
  transform: translateY(25px);
  opacity: 0;
}
</style>