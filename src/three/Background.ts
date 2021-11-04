// @ts-nocheck
// NOTE: This file is not used due to weird vertex shader rendering combined with separate
import { useEffect, useRef } from 'react';
import { Color, OrthographicCamera, Scene, PlaneGeometry, ShaderMaterial, DoubleSide, Mesh, Vector2 } from 'three';

const shader1 = `
  precision mediump float;

  uniform float time;
  uniform vec2 mouse;
  uniform vec2 resolution;

  void main( void ) {
    vec2 p = ( gl_FragCoord.xy / resolution.xy );

    gl_FragColor = vec4( vec3( p,1 ), 1.0 );
  }
`;

const shader2 = `
  varying vec2 vUv;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform float ratio;

  void main() {
    vec2 uv = (vUv - 0.5) * vec2(ratio, 1.0);

    gl_FragColor = vec4(mix(color1, color2, length(uv)), 1.0);
  }
`;

const shader3 = `
  precision mediump float;

  uniform float time;
  uniform vec2 mouse;
  uniform vec2 resolution;

  void main( void ) {

    vec2 p = ( gl_FragCoord.xy / resolution.xy );
    // Image
    float aspect_ratio = 16.0 / 9.0;
    // Camera
    float viewport_height = 2.0;
    float viewport_width = aspect_ratio * viewport_height;
    float focal_length = 1.0;

    vec3 origin = vec3(0, 0, 0);
    vec3 horizontal = vec3(viewport_width, 0, 0);
    vec3 vertical = vec3(0, viewport_height, 0);
    vec3 col=vec3(1);
    col = vec3(p.x+0.25,0,0);
    gl_FragColor = vec4( col*vec3(p.y)+vec3(0.5, 0.7, 1.0), 1.0 );
  }
`;

const shader4 = `
  uniform vec2 mouse;
  uniform vec2 resolution;

  vec3 st(vec2 uv) {
    float k = mod((uv.x * 5.0 - uv.y * 1.5), 1.0);
    return k < 0.33333 ? vec3(1.0, 1.0, 1.0) : k < 0.66666 ? vec3(0.70, 0.90, 1.0) : vec3(1.0, 0.8, 0.9);
  }

  void main( void ) {
    vec2 uv = ( gl_FragCoord.xy / resolution.xy );
    vec3 col = vec3(0.0);

    float k = 3.141592 * 2.0;
    vec2 dir = vec2(2048.0, 0);
    col += st(uv + dir / 2048.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const useBackground = ({ gl }) => {
  const sceneRef = useRef<Scene>();
  const cameraRef = useRef<OrthographicCamera>();

  useEffect(() => {
    if (!gl) {
      return;
    }

    const backgroundGeometry = new PlaneGeometry(2, 2, 1);
    const backgroundMaterial = new ShaderMaterial({
      uniforms: {
        //shader2
        color1: { value: new Color(0xeff0fb) }, // 0x61b0b7
        color2: { value: new Color(0x0077b6) }, //90e0ef  0x0077b6
        ratio: { value: gl.drawingBufferWidth / gl.drawingBufferHeight },
        //shader1
        time: { value: 1.0 },
        // resolution: {
        //   value: new Vector2(window.innerWidth, window.innerHeight),
        // },
        mouse: { value: new Vector2() },
      },
      side: DoubleSide,
      vertexShader: `
          varying vec2 vUv;

          void main() {
            vUv = vec2(position.x, position.y) * 0.5 + 0.5;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
          `,
      fragmentShader: shader2,
      depthTest: false,
    });
    const background = new Mesh(backgroundGeometry, backgroundMaterial);

    background.position.set(0, 0, -3);
    const s = new Scene();

    s.add(background);

    sceneRef.current = s;
    cameraRef.current = new OrthographicCamera(-1, 1, 1, -1, -1, 0);
  }, [gl]);

  return {
    sceneRef,
    cameraRef,
  };
};
