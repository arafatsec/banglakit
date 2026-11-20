# Playground

These four tools run in the page. The rest of the library needs the datasets and stays in Node.

<script setup>
import { ref } from "vue";
import { takaInWords } from "@bk/numbers.js";
import { toBanglaDate } from "@bk/calendar.js";
import { phoneticToBangla } from "@bk/phonetic.js";
import { bijoyToUnicode } from "@bk/bijoy.js";

const amount = ref("125000.50");
const date = ref("2026-02-21");
const typed = ref("ami banglay gan gai");
const bijoy = ref("Avgvi †mvbvi evsjv");

function show(fn) {
  try { return fn(); }
  catch (error) { return error.message; }
}
</script>

<label>Taka <input v-model="amount" /></label>
<p>{{ show(() => takaInWords(amount)) }}</p>

<label>Date <input v-model="date" /></label>
<p>{{ show(() => toBanglaDate(date).text) }}</p>

<label>Phonetic <input v-model="typed" /></label>
<p>{{ show(() => phoneticToBangla(typed)) }}</p>

<label>Bijoy <input v-model="bijoy" /></label>
<p>{{ show(() => bijoyToUnicode(bijoy)) }}</p>

<style>
input { margin-left: 0.5rem; min-width: 16rem; }
label { display: block; margin-top: 1rem; }
</style>
