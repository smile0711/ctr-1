<script lang="ts"   >
import { reactive } from "vue";

const events: any = {};

export default reactive({
  $on(event, callback) {
    if (!events[event]) events[event] = [];
    events[event].push(callback);
  },
  $emit(event, payload) {
    if (events[event]) {
      events[event].forEach(cb => cb(payload));
    }
  },
  open(component, props = {}) {
    return new Promise((resolve, reject) => {
      this.$emit('open', { component, props, resolve, reject });
    });
  }
});

</script>