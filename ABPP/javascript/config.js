const gvizURL =
  "https://docs.google.com/spreadsheets/d/1esBnw68ShO40EucMVDxfZCclx6mMnxOjtXcYuV2p39g/gviz/tq?tqx=out:json&gid=698619125";

const systemGroups = {
  equipments: [],
  cs: ["Cooling Water System"],
  es: ["Exhaust System", "Steam"],
  fos1: ["Fuel Oil System 1",],
  fos2: ["Fuel Oil System 2"],
  fos3: ["Fuel Oil System 3"],
  los: ["Lube Oil System"],
};

const positionMaps = {
  cs: {
    "Radiator Assembly 1": { x: 875, y: 265 },
    "Radiator Assembly 2": { x: 875, y: 640 },
    "HT Water Preheater 1": { x: 550, y: 195 },
    "HT Water Preheater 2": { x: 550, y: 565 },
    "Nozzle Cooling Water Pump 1": { x: 392, y: 170 },
    "Nozzle Cooling Water Pump 2": { x: 392, y: 545 },
  },
  es: {
    "Exhaust Gas Boiler 1": { x: 533, y: 125 },
    "Exhaust Gas Boiler 2": { x: 533, y: 465 },
  },
  fos1: {
    "LFO Supplying Pump": { x: 385, y: 550 },
  },
  fos2: {
    "HFO Supplying Pump": { x: 305, y: 420 },
    "HFO Separator": { x: 315, y: 647 },
  },
  fos3: {

  },
  los: {
    "Oil Mist Separator 1": { x: 235, y: 115 },
    "Oil Mist Separator 2": { x: 693, y: 115 },
    "Lube Oil Maintenance Tank": { x: 90, y: 360 },
    "Used Lube Oil Tank": { x: 90, y: 575 },
  },
};