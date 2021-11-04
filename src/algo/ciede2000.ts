class Helper {
  static toDegrees(rad: number) {
    const degrees = (360 * rad) / (2 * Math.PI);

    return degrees < 0 ? degrees + 360 : degrees;
  }

  static toRadians(deg: number) {
    return (2 * Math.PI * deg) / 360;
  }
}

export class ColorConversion {
  static rgb2hex(r: number, g: number, b: number) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  static hex2rgb(hexStr: string) {
    const num = hexStr.match(/\w+/);
    const hex = parseInt(num[0], 16);

    const [r, g, b] = [hex >> 16, (hex >> 8) & 0xff, hex & 0xff];

    return [r, g, b];
  }

  static rgb2hsv(r: number, g: number, b: number) {
    r = r / 255;
    g = g / 255;
    b = b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    let s = max === 0 ? 0 : d / max;
    let v = max;
    let h;

    switch (max) {
      case min:
        h = 0;
        break;
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h = h / 6;

    return [h, s, v];
  }

  static rgb2lab(r: number, g: number, b: number) {
    const [x, y, z] = this.rgb2xyz(r, g, b);
    return this.xyz2lab(x, y, z);
  }

  static lab2rgb(l: number, a: number, b: number) {
    const [x, y, z] = this.lab2xyz(l, a, b);
    return this.xyz2rgb(x, y, z);
  }

  static rgb2xyz(r: number, g: number, b: number) {
    r = r / 255;
    g = g / 255;
    b = b / 255;

    // step 1
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    // step 2
    r = r * 100;
    g = g * 100;
    b = b * 100;

    // step 3
    const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
    const z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;
    return [x, y, z];
  }

  static xyz2rgb(x: number, y: number, z: number) {
    x = x / 100;
    y = y / 100;
    z = z / 100;

    let r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
    let g = x * -0.969266 + y * 1.8760108 + z * 0.041556;
    let b = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;

    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);

    return [r, g, b];
  }

  static xyz2lab(x: number, y: number, z: number) {
    // using 10o Observer (CIE 1964)
    // CIE10_D65 = {94.811f, 100f, 107.304f} => Daylight
    const referenceX = 94.811;
    const referenceY = 100;
    const referenceZ = 107.304;
    // step 1
    x = x / referenceX;
    y = y / referenceY;
    z = z / referenceZ;

    // step 2
    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

    // step 3
    const l = 116 * y - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z);
    return [l, a, b];
  }

  static lab2xyz(l: number, a: number, b: number) {
    // using 10o Observer (CIE 1964)
    // CIE10_D65 = {94.811f, 100f, 107.304f} => Daylight
    const referenceX = 94.811;
    const referenceY = 100;
    const referenceZ = 107.304;

    let y = (l + 16) / 116;
    let x = a / 500 + y;
    let z = y - b / 200;

    const xCube = Math.pow(x, 3);
    const yCube = Math.pow(y, 3);
    const zCube = Math.pow(z, 3);

    x = xCube > 0.008856 ? xCube : (x - 16 / 116) / 7.787;
    y = yCube > 0.008856 ? yCube : (y - 16 / 116) / 7.787;
    z = zCube > 0.008856 ? zCube : (z - 16 / 116) / 7.787;

    x = x * referenceX;
    y = y * referenceY;
    z = z * referenceZ;

    return [x, y, z];
  }
}

export class ColorDiff {
  static getClosestFromGroup([r, g, b]: number[], labList: Record<string, number[][]>) {
    const labMain = ColorConversion.rgb2lab(r, g, b);

    let distance = Infinity;
    let colorLabel = '';

    Object.entries(labList).forEach(([colorKey, colorValues]) => {
      const deltas = colorValues.map((lab) => this.deltaLabE00(labMain, lab as [number, number, number]));
      const delta = Math.min(...deltas);

      if (delta < distance) {
        distance = delta;
        colorLabel = colorKey;
      }
    });

    return colorLabel;
  }

  static getClosestFromList([r, g, b]: number[], rgbList: [number, number, number][]) {
    const labMain = ColorConversion.rgb2lab(r, g, b);
    const labList = rgbList.map(([_r, _g, _b]) => ColorConversion.rgb2lab(_r, _g, _b));

    let distance = Infinity;
    let colorIndex = -1;

    labList.forEach((lab, i) => {
      const delta = this.deltaLabE00(labMain, lab);
      if (delta < distance) {
        distance = delta;
        colorIndex = i;
      }
    });

    return rgbList[colorIndex];
  }

  static deltaRGBE00([r1, g1, b1]: number[], [r2, g2, b2]: number[]) {
    const lab1 = ColorConversion.rgb2lab(r1, g1, b1);
    const lab2 = ColorConversion.rgb2lab(r2, g2, b2);

    return this.deltaLabE00(lab1, lab2);
  }

  static deltaLabE00([l1, a1, b1]: number[], [l2, a2, b2]: number[]) {
    // http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CIE2000.html
    const avgL = (l1 + l2) / 2;
    const c1 = Math.sqrt(Math.pow(a1, 2) + Math.pow(b1, 2));
    const c2 = Math.sqrt(Math.pow(a2, 2) + Math.pow(b2, 2));
    const avgC = (c1 + c2) / 2;
    const g = (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25, 7)))) / 2;

    const a1p = a1 * (1 + g);
    const a2p = a2 * (1 + g);

    const c1p = Math.sqrt(Math.pow(a1p, 2) + Math.pow(b1, 2));
    const c2p = Math.sqrt(Math.pow(a2p, 2) + Math.pow(b2, 2));

    const avgCp = (c1p + c2p) / 2;

    let h1p = Helper.toDegrees(Math.atan2(b1, a1p));
    let h2p = Helper.toDegrees(Math.atan2(b2, a2p));

    const avghp = Math.abs(h1p - h2p) > 180 ? (h1p + h2p + 360) / 2 : (h1p + h2p) / 2;

    const t =
      1 -
      0.17 * Math.cos(Helper.toRadians(avghp - 30)) +
      0.24 * Math.cos(Helper.toRadians(2 * avghp)) +
      0.32 * Math.cos(Helper.toRadians(3 * avghp + 6)) -
      0.2 * Math.cos(Helper.toRadians(4 * avghp - 63));

    let deltahp = h2p - h1p;
    if (Math.abs(deltahp) > 180) {
      if (h2p <= h1p) {
        deltahp += 360;
      } else {
        deltahp -= 360;
      }
    }

    const deltalp = l2 - l1;
    const deltacp = c2p - c1p;

    deltahp = 2 * Math.sqrt(c1p * c2p) * Math.sin(Helper.toRadians(deltahp) / 2);

    const sl = 1 + (0.015 * Math.pow(avgL - 50, 2)) / Math.sqrt(20 + Math.pow(avgL - 50, 2));
    const sc = 1 + 0.045 * avgCp;
    const sh = 1 + 0.015 * avgCp * t;

    const deltaro = 30 * Math.exp(-Math.pow((avghp - 275) / 25, 2));
    const rc = 2 * Math.sqrt(Math.pow(avgCp, 7) / (Math.pow(avgCp, 7) + Math.pow(25, 7)));
    const rt = -rc * Math.sin(2 * Helper.toRadians(deltaro));

    const kl = 1;
    const kc = 1;
    const kh = 1;

    const deltaE = Math.sqrt(
      Math.pow(deltalp / (kl * sl), 2) +
        Math.pow(deltacp / (kc * sc), 2) +
        Math.pow(deltahp / (kh * sh), 2) +
        rt * (deltacp / (kc * sc)) * (deltahp / (kh * sh)),
    );

    return deltaE;
  }
}
