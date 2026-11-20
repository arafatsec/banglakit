# Library

```js
import { takaInWords, toBanglaDate, phoneticToBangla, bijoyToUnicode, listHolidays } from "@arafatsec/banglakit";

takaInWords("125000.50");
toBanglaDate("2026-02-21").text;
phoneticToBangla("ami banglay gan gai");
bijoyToUnicode("Avgvi †mvbvi evsjv");
listHolidays(2025, { type: "general" });
```

Type definitions ship in `src/index.d.ts`. Every export named there is part of the public API.
