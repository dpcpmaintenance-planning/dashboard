const sheetURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRI4YerzHu4mr6hT73gPjJDaWV1BNncnXPl8dzEyPl-R0TYaJc4NLI8a_36KgJ61N64dnYPJ3Auob3U/pub?gid=698619125&single=true&output=csv";

const systemGroups = {
  equipments: [],
  "bottom-ash": [
    "Slag Removal System",
    "Fly Ash Handling System",
    "Electrostatic Precipitator System",
    "Limestone Handling System",
    "Combustion System",
    "Industrial Water Reuse System"
  ],
  combustion: ["Combustion System", "Coal Pipe System", "Biomass Handling System"],
  wts: ["Water Treatment System"],
  sws: ["Steam and Water", "Feedwater System", "Deaerator System", "Turbine Condensation Water System"],
  sccws: ["Seawater Instake and Drainage System", "Circulating Water System", "Close Circulating Cooling Water System", "Closed Circulating Cooling Water System"],
  cbhs: ["Coal Handling System", "Biomass Handling System"],
  cas: ["Compressed Air System"],
  fps: ["Fire Fighting System", "Fire Detection & Alarm System"],
  tls: ["Turbine Lubrication System", "Turbine Oil System"],
  cs: ["Electro-Chlorination Water System"],
  electrical: ["MV & LV Electrical"],
  substation: ["Substation"],
  "heavy-equipment": ["Heavy Equipment"],
  switchyard: ["Switchyard"],
  le: ["Lifting Equipment", "Coal Handling System"]
};

