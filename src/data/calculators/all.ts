// Every calculator definition, statically — for the prerender script and tests only.
// App code must use ./load.ts so each group stays in its own chunk.
import { CALCULATORS as everyday } from "./everyday";
import { CALCULATORS as finance } from "./finance";
import { CALCULATORS as education } from "./education";
import { CALCULATORS as technology } from "./technology";
import { CALCULATORS as home } from "./home";

export const ALL_CALCULATORS = [...everyday, ...finance, ...education, ...technology, ...home];
