import { ColorConversion } from '../algo/ciede2000';

export const COLORS = {
  red: [255, 0, 0],
  green: [0, 255, 0],
  blue: [0, 0, 255],
  white: [255, 255, 255],
  yellow: [255, 255, 0],
  orange: [255, 165, 0],
};

export const PrimaryColors = Object.values(COLORS);

type ColorGroupRecord = Record<string, (string | number[])[]>;

const ThresholdPrimaryHexGroups: ColorGroupRecord = {
  red: ['#ff6b6b', '#fa5252', '#f03e3e', '#e03131', '#c92a2a'],
  orange: ['#ffd8a8', '#ffc078', '#ffa94d', '#ff922b', '#fd7e14', '#f76707', /* extra colors */ '#ea6836'],
  yellow: ['#ffec99', '#ffe066', '#ffd43b', '#fcc419', /* extra colors */ '#c9cb32'],
  blue: ['#228be6', '#1c7ed6', '#1971c2', '#1864ab'],
  green: ['#40c057', '#37b24d', '#2f9e44', '#2b8a3e'],
  white: ['#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#ced4da'],
};

export const ThresholdPrimaryLABGroups = Object.keys(ThresholdPrimaryHexGroups).reduce<ColorGroupRecord | undefined>(
  (acc, key) => {
    acc[key] = ThresholdPrimaryHexGroups[key].map((color: string) => {
      const rgb = ColorConversion.hex2rgb(color) as [number, number, number];
      return ColorConversion.rgb2lab(...rgb);
    });

    return acc;
  },
  {},
);
// #c6ac0f --- yellow!!!

// red_hsv=[[125,200,0],[180,255,165]]
// orange_hsv1=[[0,200,150],[9,255,255]]
// orange_hsv2=[[169,0,141],[180,255,255]]
// white_hsv=[[100,0,0],[140,199,255]]
// yellow_hsv=[[20,0,0],[95,180,255]]
// blue_hsv=[[100,200,0],[149,255,255]]
// green_hsv=[[60,200,0],[99,255,255]]

// OPEN_COLORS = {'gray': [#f8f9fa, #f1f3f5, #e9ecef, #dee2e6, #ced4da,
//   #adb5bd, #868e96, #495057, #343a40, #212529],
// 'red': [#fff5f5, #ffe3e3, #ffc9c9, #ffa8a8, #ff8787,
//  #ff6b6b, #fa5252, #f03e3e, #e03131, #c92a2a],
// 'pink': [#fff0f6, #ffdeeb, #fcc2d7, #faa2c1, #f783ac,
//   #f06595, #e64980, #d6336c, #c2255c, #a61e4d],
// 'grape': [#f8f0fc, #f3d9fa, #eebefa, #e599f7, #da77f2,
//    #cc5de8, #be4bdb, #ae3ec9, #9c36b5, #862e9c],
// 'violet': [#f3f0ff, #e5dbff, #d0bfff, #b197fc, #9775fa,
//     #845ef7, #7950f2, #7048e8, #6741d9, #5f3dc4],
// 'indigo': [#edf2ff, #dbe4ff, #bac8ff, #91a7ff, #748ffc,
//     #5c7cfa, #4c6ef5, #4263eb, #3b5bdb, #364fc7],
// 'blue': [#e7f5ff, #d0ebff, #a5d8ff, #74c0fc, #4dabf7,
//   #339af0, #228be6, #1c7ed6, #1971c2, #1864ab],
// 'cyan': [#e3fafc, #c5f6fa, #99e9f2, #66d9e8, #3bc9db,
//   #22b8cf, #15aabf, #1098ad, #0c8599, #0b7285],
// 'teal': [#e6fcf5, #c3fae8, #96f2d7, #63e6be, #38d9a9,
//   #20c997, #12b886, #0ca678, #099268, #087f5b],
// 'green': [#ebfbee, #d3f9d8, #b2f2bb, #8ce99a, #69db7c,
//    #51cf66, #40c057, #37b24d, #2f9e44, #2b8a3e],
// 'lime': [#f4fce3, #e9fac8, #d8f5a2, #c0eb75, #a9e34b,
//   #94d82d, #82c91e, #74b816, #66a80f, #5c940d],
// 'yellow': [#fff9db, #fff3bf, #ffec99, #ffe066, #ffd43b,
//     #fcc419, #fab005, #f59f00, #f08c00, #e67700],
// 'orange': [#fff4e6, #ffe8cc, #ffd8a8, #ffc078, #ffa94d,
//     #ff922b, #fd7e14, #f76707, #e8590c, #d9480f]}

var abc = {
  gray: ['#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#868e96', '#495057', '#343a40', '#212529'],
  red: ['#fff5f5', '#ffe3e3', '#ffc9c9', '#ffa8a8', '#ff8787', '#ff6b6b', '#fa5252', '#f03e3e', '#e03131', '#c92a2a'],
  pink: ['#fff0f6', '#ffdeeb', '#fcc2d7', '#faa2c1', '#f783ac', '#f06595', '#e64980', '#d6336c', '#c2255c', '#a61e4d'],
  grape: ['#f8f0fc', '#f3d9fa', '#eebefa', '#e599f7', '#da77f2', '#cc5de8', '#be4bdb', '#ae3ec9', '#9c36b5', '#862e9c'],
  violet: ['#f3f0ff', '#e5dbff', '#d0bfff', '#b197fc', '#9775fa', '#845ef7', '#7950f2', '#7048e8', '#6741d9', '#5f3dc4'],
  indigo: ['#edf2ff', '#dbe4ff', '#bac8ff', '#91a7ff', '#748ffc', '#5c7cfa', '#4c6ef5', '#4263eb', '#3b5bdb', '#364fc7'],
  blue: ['#e7f5ff', '#d0ebff', '#a5d8ff', '#74c0fc', '#4dabf7', '#339af0', '#228be6', '#1c7ed6', '#1971c2', '#1864ab'],
  cyan: ['#e3fafc', '#c5f6fa', '#99e9f2', '#66d9e8', '#3bc9db', '#22b8cf', '#15aabf', '#1098ad', '#0c8599', '#0b7285'],
  teal: ['#e6fcf5', '#c3fae8', '#96f2d7', '#63e6be', '#38d9a9', '#20c997', '#12b886', '#0ca678', '#099268', '#087f5b'],
  green: ['#ebfbee', '#d3f9d8', '#b2f2bb', '#8ce99a', '#69db7c', '#51cf66', '#40c057', '#37b24d', '#2f9e44', '#2b8a3e'],
  lime: ['#f4fce3', '#e9fac8', '#d8f5a2', '#c0eb75', '#a9e34b', '#94d82d', '#82c91e', '#74b816', '#66a80f', '#5c940d'],
  yellow: ['#fff9db', '#fff3bf', '#ffec99', '#ffe066', '#ffd43b', '#fcc419', '#fab005', '#f59f00', '#f08c00', '#e67700'],
  orange: ['#fff4e6', '#ffe8cc', '#ffd8a8', '#ffc078', '#ffa94d', '#ff922b', '#fd7e14', '#f76707', '#e8590c', '#d9480f'],
};

// let abc = [
//   '#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#868e96', '#495057', '#343a40',
//   '#fff5f5', '#ffe3e3', '#ffc9c9', '#ffa8a8', '#ff8787', '#ff6b6b', '#fa5252', '#f03e3e', '#e03131',
//   '#fff0f6', '#ffdeeb', '#fcc2d7', '#faa2c1', '#f783ac', '#f06595', '#e64980', '#d6336c', '#c2255c',
//   '#f8f0fc', '#f3d9fa', '#eebefa', '#e599f7', '#da77f2', '#cc5de8', '#be4bdb', '#ae3ec9', '#9c36b5',
//   '#f3f0ff', '#e5dbff', '#d0bfff', '#b197fc', '#9775fa', '#845ef7', '#7950f2', '#7048e8', '#6741d9',
//   '#edf2ff', '#dbe4ff', '#bac8ff', '#91a7ff', '#748ffc', '#5c7cfa', '#4c6ef5', '#4263eb', '#3b5bdb',
//   '#e7f5ff', '#d0ebff', '#a5d8ff', '#74c0fc', '#4dabf7', '#339af0', '#228be6', '#1c7ed6', '#1971c2',
//   '#e3fafc', '#c5f6fa', '#99e9f2', '#66d9e8', '#3bc9db', '#22b8cf', '#15aabf', '#1098ad', '#0c8599',
//   '#e6fcf5', '#c3fae8', '#96f2d7', '#63e6be', '#38d9a9', '#20c997', '#12b886', '#0ca678', '#099268',
//   '#ebfbee', '#d3f9d8', '#b2f2bb', '#8ce99a', '#69db7c', '#51cf66', '#40c057', '#37b24d', '#2f9e44',
//   '#f4fce3', '#e9fac8', '#d8f5a2', '#c0eb75', '#a9e34b', '#94d82d', '#82c91e', '#74b816', '#66a80f',
//   '#fff9db', '#fff3bf', '#ffec99', '#ffe066', '#ffd43b', '#fcc419', '#fab005', '#f59f00', '#f08c00',
//   '#fff4e6', '#ffe8cc', '#ffd8a8', '#ffc078', '#ffa94d', '#ff922b', '#fd7e14', '#f76707', '#e8590c',
// ].map(c => ColorConversion.hex2rgb(c));

// Object.entries(abc).forEach(([col, vals]) => {
//     var outer = document.createElement('div');
//     outer.style.cssText = 'display: flex';

//   vals.forEach(val => {
//     var div = document.createElement('div');

//     div.style.cssText = `background-color: ${val}; width: 50px; height: 50px`;

//     outer.appendChild(div);
//     document.body.append(outer)
//   })
// })
