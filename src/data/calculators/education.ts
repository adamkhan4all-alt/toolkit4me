// Education & Students calculators — specs + page content. Loaded only on these calculators' pages.
import { Reader, type CalculatorDefinition, type RowValue, type Values } from "../../lib/calculators/engine";
import { fmt, pct, plural } from "../../lib/calculators/format";
import { attendance, examTotals, percentToGrade, requiredFinalScore, US_GRADE_POINTS, weightedAverage, type GradeScale } from "../../lib/calculators/formulas/education";

const is = (key: string, ...vals: string[]) => (v: Values) => vals.includes(String(v[key]));
const blankRows = (n: number, row: RowValue): RowValue[] => Array.from({ length: n }, () => ({ ...row }));

const gpa: CalculatorDefinition = {
  id: "gpa-calculator",
  spec: {
    fields: [
      {
        type: "select",
        key: "mode",
        label: "How are your grades given?",
        options: [
          { value: "letters", label: "Letter grades (US 4.0 scale)" },
          { value: "points", label: "Grade points (any scale)" },
        ],
      },
      {
        type: "rows",
        key: "courses",
        label: "Courses",
        rowLabel: "Course",
        addLabel: "Add course",
        minRows: 1,
        maxRows: 30,
        showIf: is("mode", "letters"),
        columns: [
          { type: "text", key: "name", label: "Course (optional)", maxLength: 60 },
          { type: "number", key: "credits", label: "Credits", min: 0, minExclusive: true, max: 100 },
          { type: "select", key: "grade", label: "Grade", options: US_GRADE_POINTS.map((g) => ({ value: g.grade, label: `${g.grade} (${g.points.toFixed(1)})` })) },
        ],
      },
      {
        type: "rows",
        key: "pointCourses",
        label: "Courses",
        rowLabel: "Course",
        addLabel: "Add course",
        minRows: 1,
        maxRows: 30,
        showIf: is("mode", "points"),
        columns: [
          { type: "text", key: "name", label: "Course (optional)", maxLength: 60 },
          { type: "number", key: "credits", label: "Credits", min: 0, minExclusive: true, max: 100 },
          { type: "number", key: "points", label: "Grade points", min: 0, max: 100 },
        ],
      },
    ],
    defaults: { mode: "letters", courses: blankRows(4, { name: "", credits: "", grade: "A" }), pointCourses: blankRows(4, { name: "", credits: "", points: "" }) },
    example: {
      mode: "letters",
      courses: [
        { name: "Calculus", credits: "3", grade: "A" },
        { name: "Physics", credits: "4", grade: "B+" },
        { name: "History", credits: "3", grade: "C" },
      ],
      pointCourses: blankRows(4, { name: "", credits: "", points: "" }),
    },
    calculate(v) {
      const r = new Reader(this, v);
      const letters = r.select("mode") === "letters";
      const key = letters ? "courses" : "pointCourses";
      const rows = r.rows(key).map((_, i) => ({
        weight: r.rowNum(key, i, "credits"),
        value: letters ? (US_GRADE_POINTS.find((g) => g.grade === r.rowSelect(key, i, "grade"))?.points ?? 0) : r.rowNum(key, i, "points"),
      }));
      if (rows.length === 0) r.fail(key, "Add at least one course.");
      if (r.failed) return r.failure();
      const res = weightedAverage(rows);
      return {
        ok: true,
        headline: { label: "GPA", value: fmt(res.average, 2, 2) },
        rows: [
          { label: "Total credits", value: fmt(res.totalWeight, 2) },
          { label: "Total grade points", value: fmt(res.totalPoints, 2) },
        ],
        steps: [`${rows.map((x) => `${fmt(x.value, 2)} × ${fmt(x.weight, 2)}`).join(" + ")} = ${fmt(res.totalPoints, 2)}`, `${fmt(res.totalPoints, 2)} ÷ ${fmt(res.totalWeight, 2)} credits = ${fmt(res.average, 4)}`],
      };
    },
  },
  content: {
    seo: {
      title: "GPA Calculator – Credit-Weighted Grade Point Average | Toolkit4Me",
      metaDescription: "Calculate your GPA from letter grades on the US 4.0 scale or from grade points on any scale, weighted by credit hours. Add as many courses as you need.",
      h1: "GPA Calculator",
    },
    intro: [
      "Your grade point average weights each course by its credits, so a four-credit course counts for more than a one-credit one. Enter each course's credits and grade to get your GPA for a term, with the totals behind it.",
      "Use letter grades on the common US 4.0 scale (A = 4.0, B+ = 3.3 and so on), or switch to grade points if your school uses a different scale — such as 5.0 or 10.0 — or gives points directly.",
    ],
    howTo: ["Choose letter grades or grade points.", "For each course, enter its credit hours and your grade. Add or remove courses as needed.", "Select Calculate to see your GPA."],
    formula: {
      lines: ["GPA = Σ(grade points × credits) ÷ Σ credits"],
      explanation: ["Multiply each course's grade points by its credits to get quality points, add them up, and divide by the total credits. Pass/fail courses usually aren't included — leave them out."],
    },
    workedExample: ["Calculus (3 credits, A = 4.0), Physics (4 credits, B+ = 3.3) and History (3 credits, C = 2.0): (12 + 13.2 + 6) ÷ 10 credits = 3.12."],
    faq: [
      { question: "Is an A+ worth 4.0 or 4.3?", answer: "Most US colleges cap A+ at 4.0, which this scale uses. If yours awards 4.3, switch to grade points and enter 4.3 for those courses." },
      { question: "How is GPA different from CGPA?", answer: "GPA usually means one term. CGPA (cumulative GPA) combines all terms, weighted by their credits — use the CGPA Calculator for that." },
      { question: "My university uses a 10-point scale. Can I use this?", answer: "Yes. Choose grade points and enter the points for each course on your scale. The result is on the same scale." },
    ],
    disclaimer: "education",
    related: ["cgpa-calculator", "percentage-to-grade-calculator", "required-marks-calculator", "exam-marks-calculator"],
  },
};

const cgpa: CalculatorDefinition = {
  id: "cgpa-calculator",
  spec: {
    fields: [
      {
        type: "rows",
        key: "terms",
        label: "Semesters",
        rowLabel: "Semester",
        addLabel: "Add semester",
        minRows: 1,
        maxRows: 20,
        columns: [
          { type: "number", key: "gpa", label: "GPA", min: 0, max: 100 },
          { type: "number", key: "credits", label: "Credits (optional)", min: 0, minExclusive: true, max: 1000, optional: true },
        ],
      },
    ],
    defaults: { terms: blankRows(4, { gpa: "", credits: "" }) },
    example: {
      terms: [
        { gpa: "3.4", credits: "18" },
        { gpa: "3.7", credits: "15" },
        { gpa: "3.1", credits: "17" },
      ],
    },
    calculate(v) {
      const r = new Reader(this, v);
      const rows = r.rows("terms").map((_, i) => ({ value: r.rowNum("terms", i, "gpa"), weight: r.rowOptNum("terms", i, "credits") }));
      if (rows.length === 0) r.fail("terms", "Add at least one semester.");
      const withCredits = rows.filter((x) => x.weight !== null).length;
      if (!r.failed && withCredits > 0 && withCredits < rows.length) {
        rows.forEach((x, i) => x.weight === null && r.fail(`terms.${i}.credits`, "Enter credits for every semester, or leave them all empty."));
      }
      if (r.failed) return r.failure();
      const equal = withCredits === 0;
      const res = weightedAverage(rows.map((x) => ({ value: x.value, weight: equal ? 1 : (x.weight as number) })));
      return {
        ok: true,
        headline: { label: "CGPA", value: fmt(res.average, 2, 2) },
        rows: equal ? [{ label: "Semesters", value: fmt(rows.length, 0) }] : [{ label: "Total credits", value: fmt(res.totalWeight, 2) }],
        steps: equal
          ? [`(${rows.map((x) => fmt(x.value, 2)).join(" + ")}) ÷ ${rows.length} = ${fmt(res.average, 4)}`]
          : [`${rows.map((x) => `${fmt(x.value, 2)} × ${fmt(x.weight as number, 2)}`).join(" + ")} = ${fmt(res.totalPoints, 2)}`, `${fmt(res.totalPoints, 2)} ÷ ${fmt(res.totalWeight, 2)} = ${fmt(res.average, 4)}`],
        notes: equal ? ["No credits were entered, so every semester counts equally. Add credits for an exact credit-weighted CGPA."] : undefined,
      };
    },
  },
  content: {
    seo: {
      title: "CGPA Calculator – Cumulative GPA from Semester GPAs | Toolkit4Me",
      metaDescription: "Combine semester GPAs into your cumulative GPA (CGPA), weighted by credit hours — or as a simple average if you don't know the credits. Works on any scale.",
      h1: "CGPA Calculator",
    },
    intro: [
      "Your cumulative grade point average combines every semester so far. Because semesters carry different numbers of credits, a heavy term counts for more than a light one. Enter each semester's GPA and its total credits to get your exact CGPA.",
      "If you don't know the credits, leave them all empty and the calculator gives a simple average instead — clearly labelled, because it can differ from your official figure. Any scale works, as long as every semester uses the same one.",
    ],
    howTo: ["Enter each semester's GPA.", "Enter each semester's credit hours, or leave every credits box empty for a simple average.", "Select Calculate."],
    formula: {
      lines: ["CGPA = Σ(semester GPA × semester credits) ÷ Σ credits", "Without credits: CGPA = average of the semester GPAs"],
      explanation: ["Weighting by credits gives the same answer as recalculating from every individual course, because each semester's GPA is itself credit-weighted."],
    },
    workedExample: ["Semesters of 3.4 (18 credits), 3.7 (15 credits) and 3.1 (17 credits): (61.2 + 55.5 + 52.7) ÷ 50 = 3.388, so the CGPA is 3.39. A simple average would give 3.40."],
    faq: [
      { question: "How do I convert CGPA to a percentage?", answer: "There's no universal formula — each university publishes its own conversion (some multiply a 10-point CGPA by 9.5, others use tables). Use your institution's official rule." },
      { question: "Should I include repeated or failed courses?", answer: "That depends on your institution's policy: some replace the old grade, others average both. Follow your transcript's rules." },
      { question: "Can I mix 4.0 and 10.0 scale semesters?", answer: "No — convert them to one scale first, otherwise the average is meaningless." },
    ],
    disclaimer: "education",
    related: ["gpa-calculator", "percentage-to-grade-calculator", "exam-marks-calculator", "average-calculator"],
  },
};

const percentToGradeCalc: CalculatorDefinition = {
  id: "percentage-to-grade-calculator",
  spec: {
    fields: [
      { type: "number", key: "pct", label: "Percentage", unit: "%", min: 0, max: 100 },
      {
        type: "select",
        key: "scale",
        label: "Grading scale",
        options: [
          { value: "us", label: "US letter grades (A–F with + and −)" },
          { value: "uk", label: "UK degree classification" },
        ],
      },
    ],
    defaults: { pct: "", scale: "us" },
    example: { pct: "85", scale: "us" },
    calculate(v) {
      const r = new Reader(this, v);
      const p = r.num("pct");
      const scale = r.select<GradeScale>("scale");
      if (r.failed) return r.failure();
      const g = percentToGrade(p, scale);
      return {
        ok: true,
        headline: { label: scale === "us" ? "Letter grade" : "Classification", value: g.grade },
        rows: [{ label: "Band", value: g.band }, ...(g.points !== undefined ? [{ label: "Grade points (4.0 scale)", value: fmt(g.points, 1, 1) }] : [])],
      };
    },
  },
  content: {
    seo: {
      title: "Percentage to Grade Calculator – Letter Grade & Degree Class | Toolkit4Me",
      metaDescription: "Convert a percentage into a US letter grade (with 4.0 grade points) or a UK degree classification. Shows the grade band so you know how close you are.",
      h1: "Percentage to Grade Calculator",
    },
    intro: [
      "Marks often come back as a percentage, but transcripts and applications ask for a letter grade or a classification. Enter your percentage and choose a scale to see the grade, the band it falls in and, for US grades, the matching grade points on the 4.0 scale.",
      "The US scale uses the most common cut-offs (93% and above is an A, 90–92.9% an A−, and so on down to F below 60%). The UK scale is the standard undergraduate degree classification. Schools set their own boundaries, so treat this as a guide and check your institution's scale.",
    ],
    howTo: ["Enter the percentage.", "Choose the grading scale.", "Select Calculate to see the grade and its band."],
    formula: {
      lines: ["US: A+ ≥ 97, A ≥ 93, A− ≥ 90, B+ ≥ 87, B ≥ 83, B− ≥ 80, C+ ≥ 77, C ≥ 73, C− ≥ 70, D+ ≥ 67, D ≥ 63, D− ≥ 60, F < 60", "UK: First ≥ 70, 2:1 ≥ 60, 2:2 ≥ 50, Third ≥ 40, Fail < 40"],
      explanation: ["The grade is the highest band whose minimum your percentage reaches. Boundaries are inclusive at the bottom: exactly 90% is an A−."],
    },
    workedExample: ["85% on the US scale falls in the 83–86.9% band, which is a B — worth 3.0 grade points. On the UK scale, 85% would be a First."],
    faq: [
      { question: "Why is my school's grade different?", answer: "Many schools use other cut-offs — some make 90% an A, or don't use + and − grades at all. Your syllabus or student handbook has the official scale." },
      { question: "Does it round my percentage?", answer: "No. 89.9% is below 90%, so it's a B+ on this scale. Some teachers round before assigning grades; check your course policy." },
      { question: "Is a 2:1 good?", answer: "An upper second-class degree (60–69%) is the most commonly awarded UK classification and is the minimum many graduate employers and master's programmes ask for." },
    ],
    disclaimer: "education",
    related: ["gpa-calculator", "exam-marks-calculator", "required-marks-calculator", "percentage-calculator"],
  },
};

const examMarks: CalculatorDefinition = {
  id: "exam-marks-calculator",
  spec: {
    fields: [
      {
        type: "rows",
        key: "subjects",
        label: "Subjects or papers",
        rowLabel: "Subject",
        addLabel: "Add subject",
        minRows: 1,
        maxRows: 30,
        columns: [
          { type: "text", key: "name", label: "Subject (optional)", maxLength: 60 },
          { type: "number", key: "obtained", label: "Marks obtained", min: 0 },
          { type: "number", key: "total", label: "Out of", min: 0, minExclusive: true },
        ],
      },
    ],
    defaults: { subjects: blankRows(4, { name: "", obtained: "", total: "100" }) },
    example: {
      subjects: [
        { name: "Maths", obtained: "78", total: "100" },
        { name: "English", obtained: "45", total: "50" },
        { name: "Science", obtained: "67", total: "75" },
      ],
    },
    calculate(v) {
      const r = new Reader(this, v);
      const rows = r.rows("subjects").map((_, i) => ({ obtained: r.rowNum("subjects", i, "obtained"), total: r.rowNum("subjects", i, "total") }));
      rows.forEach((x, i) => x.obtained > x.total && r.fail(`subjects.${i}.obtained`, "Marks obtained can't be more than the total."));
      if (rows.length === 0) r.fail("subjects", "Add at least one subject.");
      if (r.failed) return r.failure();
      const res = examTotals(rows);
      const names = r.rows("subjects").map((row, i) => row.name?.trim() || `Subject ${i + 1}`);
      return {
        ok: true,
        headline: { label: "Overall percentage", value: pct(res.percentage) },
        rows: [{ label: "Total marks", value: `${fmt(res.obtained, 2)} / ${fmt(res.total, 2)}` }],
        table: { caption: "Percentage by subject", headers: ["Subject", "Marks", "Percentage"], rows: rows.map((x, i) => [names[i], `${fmt(x.obtained, 2)} / ${fmt(x.total, 2)}`, pct((x.obtained / x.total) * 100)]) },
        steps: [`${fmt(res.obtained, 2)} ÷ ${fmt(res.total, 2)} × 100 = ${fmt(res.percentage, 4)}%`],
      };
    },
  },
  content: {
    seo: {
      title: "Exam Marks Calculator – Total Marks & Percentage | Toolkit4Me",
      metaDescription: "Add up marks across subjects or papers with different totals and get your overall percentage, plus the percentage for each subject. Free marks calculator.",
      h1: "Exam Marks Calculator",
    },
    intro: [
      "Report cards and admission forms usually ask for your total marks and overall percentage. When papers are out of different totals — 100 for one, 50 for another — the overall percentage isn't the average of the individual percentages. This calculator adds the marks properly and shows each subject's percentage alongside.",
      "Enter as many subjects or papers as you need; naming them is optional.",
    ],
    howTo: ["For each subject, enter the marks you obtained and the maximum marks.", "Add or remove rows as needed.", "Select Calculate to see the total and the overall percentage."],
    formula: {
      lines: ["Overall % = total marks obtained ÷ total maximum marks × 100", "Subject % = marks ÷ maximum × 100"],
      explanation: ["Adding the marks first gives bigger papers more weight, which is how most boards and schools calculate an aggregate. Averaging subject percentages would treat a 50-mark paper the same as a 100-mark one."],
    },
    workedExample: ["Maths 78/100, English 45/50 and Science 67/75: 190 marks out of 225, so the overall percentage is 190 ÷ 225 × 100 ≈ 84.44%."],
    faq: [
      { question: "Why isn't my overall percentage the average of my subject percentages?", answer: "Because papers have different totals. Here the subject percentages are 78%, 90% and 89.3% (average 85.8%), but the true aggregate is 84.44% because the 100-mark paper counts for more." },
      { question: "Can I include practical or internal marks?", answer: "Yes — add them as separate rows with their own maximum, or combine them with the theory marks for that subject, whichever matches your marksheet." },
      { question: "Does it apply grace marks or best-of-five rules?", answer: "No. Enter only the subjects and marks your board counts towards the aggregate." },
    ],
    disclaimer: "education",
    related: ["percentage-to-grade-calculator", "required-marks-calculator", "gpa-calculator", "percentage-calculator"],
  },
};

const requiredMarks: CalculatorDefinition = {
  id: "required-marks-calculator",
  spec: {
    fields: [
      { type: "number", key: "current", label: "Current grade (before the final)", unit: "%", min: 0, max: 200 },
      { type: "number", key: "weight", label: "Final exam weight", unit: "% of the overall grade", min: 0, minExclusive: true, max: 100 },
      { type: "number", key: "target", label: "Overall grade you want", unit: "%", min: 0, max: 200 },
    ],
    defaults: { current: "", weight: "", target: "" },
    example: { current: "82", weight: "30", target: "85" },
    calculate(v) {
      const r = new Reader(this, v);
      const current = r.num("current");
      const weight = r.num("weight");
      const target = r.num("target");
      if (r.failed) return r.failure();
      const need = requiredFinalScore(current, weight, target);
      const notes =
        need > 100
          ? ["You'd need more than 100% on the final, so this target isn't reachable unless there's extra credit."]
          : need <= 0
            ? ["You've already secured this target — even 0% on the final keeps you at or above it."]
            : undefined;
      return {
        ok: true,
        headline: { label: "Score needed on the final", value: pct(Math.max(need, 0)) },
        rows: [{ label: "If you score 100% on the final", value: pct(current * (1 - weight / 100) + weight) }, { label: "If you score 0% on the final", value: pct(current * (1 - weight / 100)) }],
        steps: [`(${fmt(target, 4)} − ${fmt(current, 4)} × (1 − ${fmt(weight / 100, 4)})) ÷ ${fmt(weight / 100, 4)} = ${fmt(need, 4)}%`],
        notes,
      };
    },
  },
  content: {
    seo: {
      title: "Required Marks Calculator – What Do I Need on My Final? | Toolkit4Me",
      metaDescription: "Find the score you need on your final exam to reach a target grade, from your current grade and how much the final is worth. Shows best and worst cases.",
      h1: "Required Marks Calculator",
    },
    intro: [
      "With the final exam coming up, the useful question isn't your current grade — it's what you need on the final to end up where you want. Enter your current grade, how much the final is worth and the overall grade you're aiming for, and the calculator gives the exact score required.",
      "It also shows the best and worst overall grade you can finish with, so you know your range before you walk into the exam room.",
    ],
    howTo: ["Enter your current grade on everything before the final, as a percentage.", "Enter the final's weight — for example 30 if it's worth 30% of the course.", "Enter your target overall grade and select Calculate."],
    formula: {
      lines: ["Required final = (target − current × (1 − w)) ÷ w", "w = final weight as a decimal (30% → 0.3)"],
      explanation: ["Your overall grade is current × (1 − w) + final × w. Solving that for the final score gives the formula above."],
    },
    workedExample: ["Current grade 82%, final worth 30%, target 85%: (85 − 82 × 0.7) ÷ 0.3 = (85 − 57.4) ÷ 0.3 = 92%. Scoring 100% would give 87.4% overall; scoring 0% would give 57.4%."],
    faq: [
      { question: "What if the answer is over 100%?", answer: "Then the target can't be reached with the final alone. Check whether there's extra credit, or work out what's achievable using the \"if you score 100%\" line." },
      { question: "My course has several remaining assessments. Can I use this?", answer: "Yes — treat everything still to come as the \"final\": add their weights together and the result is the average you need across them." },
      { question: "What should I enter as my current grade?", answer: "Your weighted average on everything completed so far, as a percentage. Most learning platforms show this; otherwise use the Exam Marks Calculator." },
    ],
    disclaimer: "education",
    related: ["exam-marks-calculator", "percentage-to-grade-calculator", "gpa-calculator", "attendance-percentage-calculator"],
  },
};

const attendanceCalc: CalculatorDefinition = {
  id: "attendance-percentage-calculator",
  spec: {
    fields: [
      { type: "number", key: "attended", label: "Classes attended", min: 0, integer: true },
      { type: "number", key: "total", label: "Total classes held", min: 0, minExclusive: true, integer: true },
      { type: "number", key: "target", label: "Required attendance", unit: "%", min: 0, max: 100 },
    ],
    defaults: { attended: "", total: "", target: "75" },
    example: { attended: "36", total: "40", target: "75" },
    calculate(v) {
      const r = new Reader(this, v);
      const attended = r.num("attended");
      const total = r.num("total");
      const target = r.num("target");
      if (!r.failed && attended > total) r.fail("attended", "Classes attended can't be more than the total held.");
      if (r.failed) return r.failure();
      const res = attendance(attended, total, target);
      const rows = res.meetsTarget
        ? [{ label: "You can miss", value: Number.isFinite(res.canMiss) ? `${plural(res.canMiss, "class", "classes")} in a row and stay at ${fmt(target)}% or above` : "Any number of classes (no minimum)" }]
        : [{ label: "You need to attend", value: res.needToAttend === null ? "Not possible — you've already missed a class, so 100% can't be reached" : `${plural(res.needToAttend, "class", "classes")} in a row to reach ${fmt(target)}%` }];
      return {
        ok: true,
        headline: { label: "Attendance", value: pct(res.percentage) },
        rows: [{ label: "Status", value: res.meetsTarget ? `At or above ${fmt(target)}%` : `Below ${fmt(target)}%` }, ...rows],
        steps: [`${fmt(attended, 0)} ÷ ${fmt(total, 0)} × 100 = ${fmt(res.percentage, 4)}%`],
      };
    },
  },
  content: {
    seo: {
      title: "Attendance Percentage Calculator – Classes You Can Miss | Toolkit4Me",
      metaDescription: "Calculate your attendance percentage and find out how many classes you can skip, or must attend, to stay above a minimum such as 75%. Free and instant.",
      h1: "Attendance Percentage Calculator",
    },
    intro: [
      "Many colleges and universities require a minimum attendance — often 75% — to sit exams. Enter how many classes you've attended and how many have been held to see your attendance percentage, and either how many classes you can still afford to miss or how many you need to attend in a row to get back above the minimum.",
      "The answers assume every future class you count is attended (or missed) in a row, which is the simplest way to plan. Medical leave and other exemptions follow your institution's rules.",
    ],
    howTo: ["Enter the classes you've attended and the total held so far.", "Set the minimum attendance required (75% by default).", "Select Calculate."],
    formula: {
      lines: ["Attendance % = attended ÷ total × 100", "Can miss = ⌊attended × 100 ÷ target − total⌋", "Need to attend = ⌈(target × total − 100 × attended) ÷ (100 − target)⌉"],
      explanation: ["Missing classes adds to the total but not to attended; attending adds to both. The formulas find the largest number of misses, or the smallest run of attendance, that keeps the percentage at the target."],
    },
    workedExample: ["36 of 40 classes is 90%. With a 75% minimum you can miss 8 classes in a row: 36 ÷ 48 = 75% exactly. With 29 of 40 (72.5%), you'd need to attend the next 4 classes: 33 ÷ 44 = 75%."],
    faq: [
      { question: "Does 74.9% count as 75%?", answer: "Usually not — most institutions require the minimum without rounding up. This calculator treats anything below the target as below." },
      { question: "Are labs and lectures counted separately?", answer: "At many institutions, yes. Run the calculator separately for each if your college tracks them separately." },
      { question: "Why can't I reach 100%?", answer: "Once you've missed a single class, attending more can bring you closer to 100% but never all the way." },
    ],
    disclaimer: "education",
    related: ["percentage-calculator", "required-marks-calculator", "days-between-dates-calculator", "exam-marks-calculator"],
  },
};

export const CALCULATORS: CalculatorDefinition[] = [gpa, cgpa, percentToGradeCalc, examMarks, requiredMarks, attendanceCalc];
