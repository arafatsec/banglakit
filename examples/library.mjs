// node examples/library.mjs
import { takaInWords, toBanglaDate, phoneticToBangla, bijoyToUnicode, findArea, listMfs } from "../src/index.js";

console.log(takaInWords("125000.50"));
console.log(toBanglaDate("2026-02-21").text);
console.log(phoneticToBangla("ami banglay gan gai"));
console.log(bijoyToUnicode("Avgvi †mvbvi evsjv"));
console.log(findArea("savar")[0].district, findArea("savar")[0].districtCode);
console.log(listMfs().map((row) => row.service).join(", "));
