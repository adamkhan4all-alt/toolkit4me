// Home & Construction calculators — specs + page content. Loaded only on these calculators' pages.
import { Reader, type CalculatorDefinition, type Values } from "../../lib/calculators/engine";
import { fmt, money } from "../../lib/calculators/format";
import {
  areaSqFt,
  energyCost,
  fuelLitres,
  KM_PER_MILE,
  LITRES_PER_UK_GALLON,
  LITRES_PER_US_GALLON,
  MARLA_STANDARDS,
  MARLAS_PER_KANAL,
  pricePerLitre,
  SQ_FT_PER_ACRE,
  SQ_FT_PER_SQ_YD,
  SQ_M_PER_SQ_FT,
  type EfficiencyUnit,
  type FuelPriceUnit,
  type MarlaStandard,
  type Shape,
} from "../../lib/calculators/formulas/units";

const is = (key: string, ...vals: string[]) => (v: Values) => vals.includes(String(v[key]));

const electricity: CalculatorDefinition = {
  id: "electricity-cost-calculator",
  spec: {
    fields: [
      { type: "number", key: "watts", label: "Power rating", unit: "watts (W)", min: 0, max: 1_000_000, help: "On the appliance label or manual. 1 kW = 1,000 W." },
      { type: "number", key: "hours", label: "Hours used per day", min: 0, max: 24 },
      { type: "number", key: "days", label: "Number of days", min: 0, max: 3660 },
      { type: "number", key: "rate", label: "Electricity price per kWh", min: 0, help: "From your bill — in your own currency." },
      { type: "number", key: "qty", label: "Number of appliances", min: 1, max: 10000, integer: true },
    ],
    defaults: { watts: "", hours: "", days: "30", rate: "", qty: "1" },
    example: { watts: "1500", hours: "4", days: "30", rate: "0.20", qty: "1" },
    calculate(v) {
      const r = new Reader(this, v);
      const watts = r.num("watts");
      const hours = r.num("hours");
      const days = r.num("days");
      const rate = r.num("rate");
      const qty = r.num("qty");
      if (r.failed) return r.failure();
      const res = energyCost(watts, hours, days, rate, qty);
      return {
        ok: true,
        headline: { label: `Cost for ${fmt(days, 2)} days`, value: money(res.cost) },
        rows: [
          { label: "Energy used", value: `${fmt(res.kwh, 3)} kWh` },
          { label: "Per day", value: `${money(res.costPerDay)} (${fmt(res.kwhPerDay, 3)} kWh)` },
          { label: "Per year (365 days)", value: `${money(res.costPerDay * 365)} (${fmt(res.kwhPerDay * 365, 1)} kWh)` },
        ],
        steps: [`${fmt(watts, 2)} W × ${fmt(hours, 2)} h × ${fmt(qty, 0)} ÷ 1,000 = ${fmt(res.kwhPerDay, 3)} kWh per day`, `${fmt(res.kwhPerDay, 3)} kWh × ${fmt(days, 2)} days × ${fmt(rate, 4)} = ${money(res.cost)}`],
      };
    },
  },
  content: {
    seo: {
      title: "Electricity Cost Calculator – Appliance Running Cost | Toolkit4Me",
      metaDescription: "Work out how much electricity an appliance uses and what it costs to run per day, month and year, from its wattage, daily hours and your price per kWh.",
      h1: "Electricity Appliance Cost Calculator",
    },
    intro: [
      "Heaters, air conditioners, kettles and gaming PCs can quietly add a lot to an electricity bill. Enter an appliance's power in watts, how many hours a day it runs and your price per kilowatt-hour to see the energy it uses and what it costs per day, for the period you choose and over a year.",
      "Prices are in your own currency — enter the rate exactly as it appears on your bill. No exchange rates or tariffs are built in.",
    ],
    howTo: ["Find the appliance's wattage on its label or in its manual.", "Enter how many hours a day it's used and for how many days.", "Enter your electricity price per kWh and select Calculate."],
    formula: {
      lines: ["kWh = watts × hours × number of appliances ÷ 1,000", "Cost = kWh × price per kWh"],
      explanation: ["A kilowatt-hour is 1,000 watts used for one hour — the unit your electricity is billed in. Appliances with thermostats or compressors (fridges, heaters, AC) don't run at full power all the time, so their real use is often lower than the label suggests."],
    },
    workedExample: ["A 1,500 W heater used 4 hours a day: 1,500 × 4 ÷ 1,000 = 6 kWh a day. At 0.20 per kWh that's 1.20 a day, 36.00 for 30 days and 438.00 over a year."],
    faq: [
      { question: "Where do I find the wattage?", answer: "On the rating plate or sticker (often on the back or underneath), in the manual, or on the charger. If it only shows amps, multiply by your mains voltage: 5 A × 230 V = 1,150 W." },
      { question: "Why is my bill different?", answer: "Bills include fixed daily charges, taxes and tiered or time-of-use rates, and appliances cycle on and off. A plug-in energy monitor gives the most accurate figure for a single device." },
      { question: "Does standby power matter?", answer: "It can: a device drawing 5 W on standby all year uses about 44 kWh. Enter the standby wattage with 24 hours a day to see its cost." },
    ],
    disclaimer: "finance",
    related: ["fuel-cost-calculator", "percentage-calculator", "square-feet-calculator", "discount-calculator"],
  },
};

const fuel: CalculatorDefinition = {
  id: "fuel-cost-calculator",
  spec: {
    fields: [
      { type: "number", key: "distance", label: "Distance", min: 0 },
      {
        type: "select",
        key: "distUnit",
        label: "Distance unit",
        options: [
          { value: "km", label: "Kilometres" },
          { value: "mi", label: "Miles" },
        ],
      },
      { type: "number", key: "eff", label: "Fuel economy", min: 0, minExclusive: true },
      {
        type: "select",
        key: "effUnit",
        label: "Fuel economy unit",
        options: [
          { value: "l_per_100km", label: "L/100 km" },
          { value: "km_per_l", label: "km per litre" },
          { value: "mpg_us", label: "MPG (US gallons)" },
          { value: "mpg_uk", label: "MPG (UK gallons)" },
        ],
      },
      { type: "number", key: "price", label: "Fuel price", min: 0 },
      {
        type: "select",
        key: "priceUnit",
        label: "Price per",
        options: [
          { value: "per_l", label: "Litre" },
          { value: "per_us_gal", label: "US gallon" },
          { value: "per_uk_gal", label: "UK gallon" },
        ],
      },
      { type: "checkbox", key: "roundTrip", label: "Return trip (double the distance)" },
      { type: "number", key: "people", label: "Split between", unit: "people", min: 1, max: 100, integer: true },
    ],
    defaults: { distance: "", distUnit: "km", eff: "", effUnit: "l_per_100km", price: "", priceUnit: "per_l", roundTrip: "false", people: "1" },
    example: { distance: "350", distUnit: "km", eff: "7.5", effUnit: "l_per_100km", price: "1.80", priceUnit: "per_l", roundTrip: "false", people: "1" },
    calculate(v) {
      const r = new Reader(this, v);
      const distance = r.num("distance");
      const distUnit = r.select("distUnit");
      const eff = r.num("eff");
      const effUnit = r.select<EfficiencyUnit>("effUnit");
      const price = r.num("price");
      const priceUnit = r.select<FuelPriceUnit>("priceUnit");
      const people = r.num("people");
      if (r.failed) return r.failure();
      const km = (distUnit === "mi" ? distance * KM_PER_MILE : distance) * (r.bool("roundTrip") ? 2 : 1);
      const litres = fuelLitres(km, eff, effUnit);
      const cost = litres * pricePerLitre(price, priceUnit);
      const volume = priceUnit === "per_l" ? `${fmt(litres, 2)} L` : `${fmt(litres / (priceUnit === "per_us_gal" ? LITRES_PER_US_GALLON : LITRES_PER_UK_GALLON), 2)} ${priceUnit === "per_us_gal" ? "US" : "UK"} gal (${fmt(litres, 2)} L)`;
      return {
        ok: true,
        headline: { label: "Fuel cost", value: money(cost) },
        rows: [
          { label: "Fuel needed", value: volume },
          { label: "Distance", value: `${fmt(km, 1)} km (${fmt(km / KM_PER_MILE, 1)} mi)` },
          ...(people > 1 ? [{ label: "Per person", value: money(cost / people) }] : []),
          { label: "Cost per km", value: km ? money(cost / km) : "—" },
        ],
        steps: [`Fuel = ${fmt(km, 2)} km at ${fmt(eff, 4)} ${effUnit.replace(/_/g, " ")} = ${fmt(litres, 3)} L`, `Cost = ${fmt(litres, 3)} L × ${fmt(pricePerLitre(price, priceUnit), 4)} per L = ${money(cost)}`],
      };
    },
  },
  content: {
    seo: {
      title: "Fuel Cost Calculator – Trip Petrol & Diesel Cost | Toolkit4Me",
      metaDescription: "Calculate fuel needed and trip cost from distance, fuel economy (L/100 km, km/L or MPG) and fuel price per litre or gallon. Split the cost between passengers.",
      h1: "Fuel Cost Calculator",
    },
    intro: [
      "Planning a road trip, comparing driving with the train, or splitting costs with friends? Enter the distance, your car's fuel economy and the price of fuel to see how much fuel you'll use and what it will cost — one way or return, and per person if you're sharing.",
      "It understands every common way of measuring economy: litres per 100 km, kilometres per litre, and miles per gallon in both US and UK (imperial) gallons, which differ by about 20%.",
    ],
    howTo: ["Enter the distance in kilometres or miles.", "Enter your car's fuel economy and choose its unit.", "Enter the fuel price and whether it's per litre or per gallon, then select Calculate."],
    formula: {
      lines: ["L/100 km: fuel = distance × economy ÷ 100", "km/L: fuel = distance ÷ economy", "MPG: fuel (gallons) = miles ÷ MPG", "Cost = fuel × price"],
      explanation: ["Everything is converted to kilometres and litres first (1 mile = 1.609344 km, 1 US gallon = 3.785 L, 1 UK gallon = 4.546 L), so you can mix units freely."],
    },
    workedExample: ["A 350 km drive in a car using 7.5 L/100 km needs 350 × 7.5 ÷ 100 = 26.25 litres. At 1.80 per litre the fuel costs 47.25 — or 94.50 for the return trip."],
    faq: [
      { question: "Where do I find my car's fuel economy?", answer: "The trip computer shows real-world consumption; the manufacturer's figure is usually optimistic. Or fill the tank, drive, refill and divide the litres by the distance." },
      { question: "Why are US and UK MPG different?", answer: "A UK (imperial) gallon is 4.546 litres and a US gallon is 3.785 litres, so the same car shows a higher MPG in UK gallons. Choose the one your figure uses." },
      { question: "Does it include tolls or wear?", answer: "No — fuel only. Add tolls, parking and maintenance separately if you're working out the full cost of a trip." },
    ],
    disclaimer: "finance",
    related: ["electricity-cost-calculator", "tip-calculator", "percentage-calculator", "square-feet-calculator"],
  },
};

const LENGTH_UNITS = [
  { value: "ft", label: "Feet (ft)" },
  { value: "in", label: "Inches (in)" },
  { value: "yd", label: "Yards (yd)" },
  { value: "m", label: "Metres (m)" },
  { value: "cm", label: "Centimetres (cm)" },
];

const squareFeet: CalculatorDefinition = {
  id: "square-feet-calculator",
  spec: {
    fields: [
      {
        type: "select",
        key: "shape",
        label: "Shape",
        options: [
          { value: "rectangle", label: "Rectangle or square" },
          { value: "circle", label: "Circle" },
          { value: "triangle", label: "Triangle" },
        ],
      },
      { type: "select", key: "unit", label: "Measurements in", options: LENGTH_UNITS },
      { type: "number", key: "length", label: "Length", min: 0, showIf: is("shape", "rectangle") },
      { type: "number", key: "width", label: "Width", min: 0, showIf: is("shape", "rectangle") },
      { type: "number", key: "radius", label: "Radius", min: 0, help: "Half the diameter.", showIf: is("shape", "circle") },
      { type: "number", key: "base", label: "Base", min: 0, showIf: is("shape", "triangle") },
      { type: "number", key: "height", label: "Height", min: 0, help: "Measured at right angles to the base.", showIf: is("shape", "triangle") },
      { type: "number", key: "qty", label: "Number of identical areas", min: 1, max: 10000, integer: true },
      { type: "number", key: "price", label: "Price per square foot (optional)", min: 0, optional: true, help: "For flooring, tiles or paint quotes." },
    ],
    defaults: { shape: "rectangle", unit: "ft", length: "", width: "", radius: "", base: "", height: "", qty: "1", price: "" },
    example: { shape: "rectangle", unit: "ft", length: "12", width: "15", radius: "", base: "", height: "", qty: "1", price: "" },
    calculate(v) {
      const r = new Reader(this, v);
      const shape = r.select<Shape>("shape");
      const unit = r.select("unit");
      const [a, b] = shape === "rectangle" ? [r.num("length"), r.num("width")] : shape === "circle" ? [r.num("radius"), 0] : [r.num("base"), r.num("height")];
      const qty = r.num("qty");
      const price = r.optNum("price");
      if (r.failed) return r.failure();
      const sqft = areaSqFt(shape, a, b, unit) * qty;
      return {
        ok: true,
        headline: { label: "Area", value: `${fmt(sqft, 2)} sq ft` },
        rows: [
          { label: "Square metres", value: `${fmt(sqft * SQ_M_PER_SQ_FT, 2)} m²` },
          { label: "Square yards", value: `${fmt(sqft / SQ_FT_PER_SQ_YD, 2)} sq yd` },
          { label: "Acres", value: fmt(sqft / SQ_FT_PER_ACRE, 6) },
          ...(price !== null ? [{ label: "Estimated cost", value: money(sqft * price) }] : []),
        ],
        steps: [
          shape === "rectangle"
            ? `${fmt(a, 4)} ${unit} × ${fmt(b, 4)} ${unit}${qty > 1 ? ` × ${qty}` : ""} = ${fmt(sqft, 2)} sq ft`
            : shape === "circle"
              ? `π × ${fmt(a, 4)}² ${unit}${qty > 1 ? ` × ${qty}` : ""} = ${fmt(sqft, 2)} sq ft`
              : `½ × ${fmt(a, 4)} × ${fmt(b, 4)} ${unit}${qty > 1 ? ` × ${qty}` : ""} = ${fmt(sqft, 2)} sq ft`,
        ],
      };
    },
  },
  content: {
    seo: {
      title: "Square Feet Calculator – Area in Sq Ft, m² & Sq Yd | Toolkit4Me",
      metaDescription: "Calculate area in square feet for rectangles, circles and triangles from feet, inches, metres or centimetres. Converts to m², square yards and acres, with cost.",
      h1: "Square Feet Calculator",
    },
    intro: [
      "Flooring, tiles, paint, carpet and rent are all priced by area. Enter a room's or plot's measurements — in feet, inches, yards, metres or centimetres — and get the area in square feet, square metres and square yards. Add a price per square foot to estimate the cost of materials.",
      "For L-shaped rooms, split the space into rectangles, calculate each one and add them up. Buy 5–10% extra flooring or tiles to allow for cuts and waste.",
    ],
    howTo: ["Choose the shape and the unit you measured in.", "Enter the measurements (and how many identical areas there are).", "Optionally add a price per square foot, then select Calculate."],
    formula: {
      lines: ["Rectangle: area = length × width", "Circle: area = π × radius²", "Triangle: area = ½ × base × height", "1 sq ft = 0.09290304 m² · 1 sq yd = 9 sq ft · 1 acre = 43,560 sq ft"],
      explanation: ["Measurements are converted to feet before the area is calculated (1 m = 3.2808 ft, 1 in = 1/12 ft), so the conversions are exact."],
    },
    workedExample: ["A room 12 ft by 15 ft is 12 × 15 = 180 sq ft, which is 16.72 m² or 20 square yards. At 4.50 per sq ft, flooring would cost about 810 before waste."],
    faq: [
      { question: "How do I measure an L-shaped room?", answer: "Divide it into two rectangles, calculate each area, and add them. The Number of identical areas field helps when the same shape repeats." },
      { question: "How do I convert square metres to square feet?", answer: "Multiply by 10.7639. Or enter your measurements in metres and the calculator converts automatically." },
      { question: "Should I measure to the wall or the skirting board?", answer: "For flooring, measure wall to wall at floor level. For paint, measure each wall's height × width and subtract doors and windows." },
    ],
    related: ["marla-to-square-feet-converter", "kanal-to-marla-converter", "electricity-cost-calculator", "ratio-calculator"],
  },
};

const STANDARD_OPTIONS = [
  { value: "272.25", label: "272.25 sq ft (30.25 sq yd — traditional revenue marla)" },
  { value: "250", label: "250 sq ft (used by some housing schemes)" },
  { value: "225", label: "225 sq ft (common in Lahore housing schemes)" },
];

const marla: CalculatorDefinition = {
  id: "marla-to-square-feet-converter",
  spec: {
    fields: [
      {
        type: "select",
        key: "direction",
        label: "Convert",
        options: [
          { value: "toSqft", label: "Marla → square feet" },
          { value: "toMarla", label: "Square feet → marla" },
        ],
      },
      { type: "number", key: "value", label: "Amount", min: 0 },
      { type: "select", key: "standard", label: "Marla standard", options: STANDARD_OPTIONS },
    ],
    defaults: { direction: "toSqft", value: "", standard: "272.25" },
    example: { direction: "toSqft", value: "5", standard: "225" },
    calculate(v) {
      const r = new Reader(this, v);
      const toSqft = r.select("direction") === "toSqft";
      const value = r.num("value");
      const standard = Number(r.select("standard")) as MarlaStandard;
      if (r.failed) return r.failure();
      const sqft = toSqft ? value * standard : value;
      const marlas = toSqft ? value : value / standard;
      return {
        ok: true,
        headline: toSqft ? { label: `${fmt(value, 4)} marla`, value: `${fmt(sqft, 2)} sq ft` } : { label: `${fmt(value, 2)} sq ft`, value: `${fmt(marlas, 4)} marla` },
        rows: [
          { label: "Basis used", value: `1 marla = ${fmt(standard, 2)} sq ft` },
          { label: "Square yards", value: fmt(sqft / SQ_FT_PER_SQ_YD, 2) },
          { label: "Square metres", value: fmt(sqft * SQ_M_PER_SQ_FT, 2) },
          { label: "Kanal", value: fmt(marlas / MARLAS_PER_KANAL, 4) },
        ],
        table: toSqft
          ? { caption: `${fmt(value, 4)} marla under each standard`, headers: ["Marla standard", "Square feet"], rows: MARLA_STANDARDS.map((s) => [`${fmt(s, 2)} sq ft`, fmt(value * s, 2)]) }
          : { caption: `${fmt(value, 2)} sq ft under each standard`, headers: ["Marla standard", "Marla"], rows: MARLA_STANDARDS.map((s) => [`${fmt(s, 2)} sq ft`, fmt(value / s, 4)]) },
        steps: [toSqft ? `${fmt(value, 4)} × ${fmt(standard, 2)} = ${fmt(sqft, 2)} sq ft` : `${fmt(value, 2)} ÷ ${fmt(standard, 2)} = ${fmt(marlas, 4)} marla`],
      };
    },
  },
  content: {
    seo: {
      title: "Marla to Square Feet Converter – 225, 250 or 272.25 Sq Ft | Toolkit4Me",
      metaDescription: "Convert marla to square feet and square feet to marla using the marla size you choose — 272.25, 250 or 225 sq ft — with square yards, m² and kanal.",
      h1: "Marla to Square Feet Converter",
    },
    intro: [
      "The marla is the everyday unit for plot and house sizes in Pakistan and parts of northern India — but it isn't one fixed size. The traditional marla in land revenue records is 272.25 square feet (30.25 square yards), while many housing schemes, especially in Lahore, use 225 square feet, and some use 250. A \"5 marla house\" can therefore be anywhere from 1,125 to 1,361 square feet.",
      "That's why this converter never assumes a standard: you choose one, the result states which basis was used, and a table shows the same amount under every standard so differences are obvious.",
    ],
    howTo: ["Choose the direction of the conversion.", "Enter the amount.", "Choose the marla standard used in your area or documents, then select Calculate."],
    formula: {
      lines: ["Square feet = marla × marla size", "Marla = square feet ÷ marla size", "Marla size: 272.25, 250 or 225 sq ft", "1 kanal = 20 marla"],
      explanation: ["Square yards are square feet ÷ 9; square metres are square feet × 0.09290304."],
    },
    workedExample: ["5 marla at 225 sq ft per marla is 5 × 225 = 1,125 sq ft (125 sq yd). Under the 272.25 sq ft standard, the same 5 marla is 1,361.25 sq ft — 236 sq ft more."],
    faq: [
      { question: "Which marla size should I use?", answer: "The one in your property documents or used by the authority or housing society concerned. Revenue (patwari) records traditionally use 272.25 sq ft; many Lahore schemes use 225 sq ft. If in doubt, ask the society or check the allotment letter." },
      { question: "How many square feet is 10 marla?", answer: "2,722.5 sq ft at 272.25, 2,500 sq ft at 250, or 2,250 sq ft at 225 sq ft per marla." },
      { question: "Is a marla the same in India?", answer: "Marla sizes in India also vary by state and region. Use the standard given in your local land records." },
    ],
    disclaimer: "property",
    related: ["kanal-to-marla-converter", "square-feet-calculator", "ratio-calculator", "percentage-calculator"],
  },
};

const kanal: CalculatorDefinition = {
  id: "kanal-to-marla-converter",
  spec: {
    fields: [
      {
        type: "select",
        key: "direction",
        label: "Convert",
        options: [
          { value: "toMarla", label: "Kanal → marla and square feet" },
          { value: "toKanal", label: "Marla → kanal" },
        ],
      },
      { type: "number", key: "value", label: "Amount", min: 0 },
      { type: "select", key: "standard", label: "Marla standard (for square feet)", options: STANDARD_OPTIONS },
    ],
    defaults: { direction: "toMarla", value: "", standard: "272.25" },
    example: { direction: "toMarla", value: "1", standard: "225" },
    calculate(v) {
      const r = new Reader(this, v);
      const toMarla = r.select("direction") === "toMarla";
      const value = r.num("value");
      const standard = Number(r.select("standard")) as MarlaStandard;
      if (r.failed) return r.failure();
      const marlas = toMarla ? value * MARLAS_PER_KANAL : value;
      const kanals = marlas / MARLAS_PER_KANAL;
      const sqft = marlas * standard;
      return {
        ok: true,
        headline: toMarla ? { label: `${fmt(value, 4)} kanal`, value: `${fmt(marlas, 4)} marla` } : { label: `${fmt(value, 4)} marla`, value: `${fmt(kanals, 4)} kanal` },
        rows: [
          { label: "Square feet", value: `${fmt(sqft, 2)} (at ${fmt(standard, 2)} sq ft per marla)` },
          { label: "Square yards", value: fmt(sqft / SQ_FT_PER_SQ_YD, 2) },
          { label: "Square metres", value: fmt(sqft * SQ_M_PER_SQ_FT, 2) },
          { label: "Acres", value: fmt(sqft / SQ_FT_PER_ACRE, 4) },
        ],
        table: { caption: `${fmt(kanals, 4)} kanal in square feet under each marla standard`, headers: ["Marla standard", "Square feet"], rows: MARLA_STANDARDS.map((s) => [`${fmt(s, 2)} sq ft`, fmt(marlas * s, 2)]) },
        steps: [toMarla ? `${fmt(value, 4)} kanal × 20 = ${fmt(marlas, 4)} marla` : `${fmt(value, 4)} marla ÷ 20 = ${fmt(kanals, 4)} kanal`, `${fmt(marlas, 4)} marla × ${fmt(standard, 2)} = ${fmt(sqft, 2)} sq ft`],
      };
    },
  },
  content: {
    seo: {
      title: "Kanal to Marla Converter – Kanal, Marla & Square Feet | Toolkit4Me",
      metaDescription: "Convert kanal to marla (1 kanal = 20 marla) and to square feet using your chosen marla size, or marla back to kanal. Shows square yards, m² and acres.",
      h1: "Kanal to Marla Converter",
    },
    intro: [
      "A kanal is always 20 marla — that part is universal. Its size in square feet, though, depends on which marla is being used: 5,445 sq ft with the traditional 272.25 sq ft marla, 5,000 sq ft at 250, or 4,500 sq ft at 225. That's a 945 sq ft difference on a single \"1 kanal\" plot.",
      "Convert kanal to marla (or back), choose the marla standard, and see the area in square feet, square yards, square metres and acres — with a table comparing all three standards.",
    ],
    howTo: ["Choose kanal → marla or marla → kanal.", "Enter the amount.", "Choose the marla standard for the square-foot figures and select Calculate."],
    formula: {
      lines: ["Marla = kanal × 20", "Kanal = marla ÷ 20", "Square feet = marla × marla size (272.25, 250 or 225)"],
      explanation: ["8 kanal make one acre under the traditional standard (8 × 5,445 = 43,560 sq ft). With smaller marla sizes, 8 kanal is less than an acre."],
    },
    workedExample: ["1 kanal = 20 marla. With a 225 sq ft marla that's 4,500 sq ft (500 sq yd); with the 272.25 sq ft marla it's 5,445 sq ft (605 sq yd)."],
    faq: [
      { question: "How many marla are in a kanal?", answer: "20, under every standard. Only the square-foot size of each marla changes." },
      { question: "How many kanal are in an acre?", answer: "8 kanal, using the traditional 272.25 sq ft marla (8 × 20 × 272.25 = 43,560 sq ft, one acre)." },
      { question: "Why does my society say 1 kanal is 4,500 sq ft?", answer: "Because it uses a 225 sq ft marla. Always check which standard a plot size refers to before comparing prices." },
    ],
    disclaimer: "property",
    related: ["marla-to-square-feet-converter", "square-feet-calculator", "ratio-calculator", "percentage-calculator"],
  },
};

export const CALCULATORS: CalculatorDefinition[] = [electricity, fuel, squareFeet, marla, kanal];
