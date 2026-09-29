import { createApp } from "vue";
import "@cheese/css";
import "./site.css";
import VueDemo from "./VueDemo.vue";
import VuePatternsDemo from "./VuePatternsDemo.vue";
import VueFoundationDemo from "./VueFoundationDemo.vue";
import VueCompositionDemo from "./VueCompositionDemo.vue";
const demo = new URLSearchParams(location.search).get("demo");
createApp(
  demo === "composition"
    ? VueCompositionDemo
    : demo === "foundation"
      ? VueFoundationDemo
      : demo === "patterns"
        ? VuePatternsDemo
        : VueDemo,
).mount("#app");
