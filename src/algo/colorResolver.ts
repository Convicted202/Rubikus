import { ColorConversion, ColorDiff } from './ciede2000';
import { ColorParsingException } from '../utils/errors';

type StandardColorsType = 'red' | 'white' | 'green' | 'yellow' | 'orange' | 'blue';

const toId = (c: [number, number, number]) => c.join(',');
const fromId = (cId: string) => cId.split(',').map(Number);

const removeOnIndex = (arr: any[], index: number) => arr.filter((_, i) => i !== index);

// just a helper
// const closestColorPair = (neighborsObj: Record<string, Record<string, number>>) => {
//   let colorPair: string[] = [];
//   let minDistance = Infinity;
//   Object.entries(neighborsObj).forEach(([cId, neighborDistances]) => {
//     Object.entries(neighborDistances).forEach(([tId, distance]) => {
//       if (distance < minDistance) {
//         minDistance = distance;
//         colorPair = [cId, tId];
//       }
//     });
//   });

//   return colorPair;
// };

// just a helper
const avgByIndex = (dataset: number[][], index: number) => {
  const sum = dataset.reduce((acc, el) => {
    return acc + el[index];
  }, 0);
  return sum / dataset.length;
};

const isSquare = function (size: number) {
  return Math.sqrt(size) % 1 === 0;
};

enum ColorComponent {
  Red = 0,
  Green = 1,
  Blue = 2,
}

export class ColorResolver {
  /*
    Blue group is the group with smallest red component
    Green group is the second one with smallest red component
    Red group is the remaining group with the smallest green component
    Orange group is the second remaining group with the smallest green component
    Yellow and white groups are discriminated by saying that yellow group has less blue component than white

    https://ballcuber.github.io/color-detection/
    */
  static mapColorsToStandardSchema(hexColors: string[]) {
    const colors = hexColors.map((c) => ColorConversion.hex2rgb(c) as [number, number, number]);

    // phase1: calculate every color distance with every other color
    const groupLength = colors.length / 6;
    if (!isSquare(groupLength)) {
      throw new ColorParsingException('Provided colors amount do not correspond tp face colors amount');
    }

    const neighbors: Record<string, Record<string, number>> = {};

    colors.forEach((c, i) => {
      const cId = toId(c);
      if (!neighbors[cId]) {
        neighbors[cId] = {};
      }

      colors.forEach((testedC, j) => {
        if (i === j) {
          return;
        }

        const tId = toId(testedC);
        const delta = neighbors[tId]?.[cId] !== undefined ? neighbors[tId][cId] : ColorDiff.deltaRGBE00(c, testedC);

        neighbors[cId][tId] = delta;
      });
    });

    // phase2: form a group with 2 closest colors, then push colors into the group with min distance to each element in the group
    // repeat until we have 6 groups
    const groups = [];
    const selected: Record<string, boolean> = {};
    let currentGroup = [];
    while (groups.length < 6) {
      if (!currentGroup.length) {
        let colorPair: string[] = [];
        let minDistance = Infinity;
        Object.entries(neighbors).forEach(([cId, neighborDistances]) => {
          Object.entries(neighborDistances).forEach(([tId, distance]) => {
            if (!selected[cId] && !selected[tId] && distance < minDistance) {
              minDistance = distance;
              colorPair = [cId, tId];
            }
          });
        });

        const [first, second] = colorPair;

        selected[first] = true;
        selected[second] = true;
        currentGroup.push(first, second);
      } else {
        let color: string;
        let minDistance = Infinity;

        currentGroup.forEach((c) => {
          const curNeighbors = neighbors[c];

          Object.entries(curNeighbors).forEach(([tId, distance]) => {
            if (!selected[tId] && distance < minDistance) {
              minDistance = distance;
              color = tId;
            }
          });
        });

        selected[color] = true;
        currentGroup.push(color);
      }

      if (currentGroup.length === groupLength) {
        groups.push(currentGroup);
        currentGroup = [];
      }
    }

    // phase3: reduce all group colors to 6 colors
    const colorGroups = groups.map((group) => group.map((c) => fromId(c)));
    let cGroups = Array.from(colorGroups);
    const colorMap: Partial<Record<string, StandardColorsType>> = {};

    const blueOrGreenGroupIndex1 = this.minComponentGroupIndex(cGroups, ColorComponent.Red);
    const blueOrGreenGroup1 = cGroups[blueOrGreenGroupIndex1];
    const avgBlueOrGreenGroup1 = this.averageGroupColor(blueOrGreenGroup1);
    cGroups = removeOnIndex(cGroups, blueOrGreenGroupIndex1);

    const blueOrGreenGroupIndex2 = this.minComponentGroupIndex(cGroups, ColorComponent.Red);
    const blueOrGreenGroup2 = cGroups[blueOrGreenGroupIndex2];
    const avgBlueOrGreenGroup2 = this.averageGroupColor(blueOrGreenGroup2);
    cGroups = removeOnIndex(cGroups, blueOrGreenGroupIndex2);

    // sometimes blue and green groups are switched, so we need to test them againist pure blue
    const pureBlue = [0, 0, 255];
    const group1Diff = ColorDiff.deltaRGBE00(pureBlue, avgBlueOrGreenGroup1);
    const group2Diff = ColorDiff.deltaRGBE00(pureBlue, avgBlueOrGreenGroup2);

    let blueGroup;
    let greenGroup;
    if (group1Diff < group2Diff) {
      blueGroup = blueOrGreenGroup1;
      greenGroup = blueOrGreenGroup2;
    } else {
      blueGroup = blueOrGreenGroup2;
      greenGroup = blueOrGreenGroup1;
    }

    const redGroupIndex = this.minComponentGroupIndex(cGroups, ColorComponent.Green);
    const redGroup = cGroups[redGroupIndex];
    cGroups = removeOnIndex(cGroups, redGroupIndex);

    const orangeGroupIndex = this.minComponentGroupIndex(cGroups, ColorComponent.Green);
    const orangeGroup = cGroups[orangeGroupIndex];
    cGroups = removeOnIndex(cGroups, orangeGroupIndex);

    const yellowGroupIndex = this.minComponentGroupIndex(cGroups, ColorComponent.Blue);
    const yellowGroup = cGroups[yellowGroupIndex];
    cGroups = removeOnIndex(cGroups, yellowGroupIndex);

    const whiteGroup = cGroups[0];

    blueGroup.forEach((b) => (colorMap[ColorConversion.rgb2hex(...(b as [number, number, number]))] = 'blue'));
    greenGroup.forEach((g) => (colorMap[ColorConversion.rgb2hex(...(g as [number, number, number]))] = 'green'));
    redGroup.forEach((r) => (colorMap[ColorConversion.rgb2hex(...(r as [number, number, number]))] = 'red'));
    orangeGroup.forEach((o) => (colorMap[ColorConversion.rgb2hex(...(o as [number, number, number]))] = 'orange'));
    yellowGroup.forEach((y) => (colorMap[ColorConversion.rgb2hex(...(y as [number, number, number]))] = 'yellow'));
    whiteGroup.forEach((w) => (colorMap[ColorConversion.rgb2hex(...(w as [number, number, number]))] = 'white'));

    return colorMap;
  }

  private static minComponentGroupIndex(groups: number[][][], componentIndex: ColorComponent) {
    let index = -1;
    let minComp = Infinity;

    groups.forEach((group, i) => {
      const comp = avgByIndex(group, componentIndex);
      if (comp < minComp) {
        minComp = comp;
        index = i;
      }
    });

    return index;
  }

  private static averageGroupColor(group: number[][]) {
    const s = group.reduce(
      (acc, color) => {
        const red = acc.red + color[ColorComponent.Red] * color[ColorComponent.Red];
        const green = acc.green + color[ColorComponent.Green] * color[ColorComponent.Green];
        const blue = acc.blue + color[ColorComponent.Blue] * color[ColorComponent.Blue];

        return { red, green, blue };
      },
      { red: 0, green: 0, blue: 0 },
    );

    return [Math.sqrt(s.red / group.length), Math.sqrt(s.green / group.length), Math.sqrt(s.blue / group.length)];
  }
}
