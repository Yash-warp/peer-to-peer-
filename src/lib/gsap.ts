import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Ensure plugin is registered safely in browser environments (SSR safe for Next.js)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export * from "gsap";
export { gsap, ScrollTrigger };
export default gsap;

