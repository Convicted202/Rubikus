import { Shape, ShapeGeometry, ExtrudeBufferGeometry } from 'three';

export const RoundedShape = (width: number, height: number, radius0: number) => {
  const shape = new Shape();
  const eps = 0.00001;
  const radius = radius0 - eps;
  shape.absarc(radius, radius, radius, -Math.PI / 2, -Math.PI, true);
  shape.absarc(radius, height - radius * 2, radius, Math.PI, Math.PI / 2, true);
  shape.absarc(width - radius * 2, height - radius * 2, radius, Math.PI / 2, 0, true);
  shape.absarc(width - radius * 2, radius, radius, 0, -Math.PI / 2, true);

  const geometry = new ShapeGeometry(shape, 5);

  geometry.center();

  return geometry;
};

export const RoundedCurvesShape = (width: number, height: number, radius: number, depth: number) => {
  const x = -width / 2;
  const y = -height / 2;

  const shape = new Shape();

  shape.moveTo(x, y + radius);
  shape.lineTo(x, y + height - radius);
  shape.quadraticCurveTo(x, y + height, x + radius, y + height);
  shape.lineTo(x + width - radius, y + height);
  shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  shape.lineTo(x + width, y + radius);
  shape.quadraticCurveTo(x + width, y, x + width - radius, y);
  shape.lineTo(x + radius, y);
  shape.quadraticCurveTo(x, y, x, y + radius);

  const geometry = new ExtrudeBufferGeometry(shape, {
    depth: depth,
    bevelEnabled: false,
    curveSegments: 3,
  });

  return geometry;
};

export const RoundedBox = (width: number, height: number, depth: number, radius0: number, smoothness: number) => {
  const shape = new Shape();
  const eps = 0.00001;
  const radius = radius0 - eps;
  shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
  shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
  shape.absarc(width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true);
  shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);

  const geometry = new ExtrudeBufferGeometry(shape, {
    depth: depth - radius0 * 2,
    bevelEnabled: true,
    bevelSegments: smoothness * 2,
    steps: 1,
    bevelSize: radius,
    bevelThickness: radius0,
    curveSegments: smoothness,
  });

  geometry.center();

  return geometry;
};
