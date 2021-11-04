import { useEffect, useState, useRef, useCallback } from 'react';
import {
  AmbientLight,
  PointLight,
  SpotLight,
  Scene,
  PerspectiveCamera,
  ShaderMaterial,
  Color,
  Vector2,
  IcosahedronBufferGeometry,
  Mesh,
  BackSide,
  WebGLRenderer,
} from 'three';
import ExpoTHREE from 'expo-three';
import { ExpoWebGLRenderingContext } from 'expo-gl';

export interface IEnvironment {
  scene?: Scene;
  camera?: PerspectiveCamera;
  renderer?: WebGLRenderer;
  gl?: ExpoWebGLRenderingContext;
  resizeTo?: (ratio?: number) => void;
}

interface IEnvironmentProps {
  gl?: ExpoWebGLRenderingContext;
}

const vertexShader = `
  // varying vec2 vUv;

  void main() {
    // vUv = vec2(position.x, position.y) * 0.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 color1;
  uniform vec3 color2;
  uniform vec2 resolution;

  float dist(vec2 p0, vec2 pf){return sqrt((pf.x-p0.x)*(pf.x-p0.x)+(pf.y-p0.y)*(pf.y-p0.y));}

  void main()
  {
    float d = dist(resolution.xy*0.5, gl_FragCoord.xy)*0.001;
    gl_FragColor = vec4(mix(color1, color2, d), 1.0 );
  }
`;

export const useEnvironment = ({ gl }: IEnvironmentProps) => {
  const [environment, setEnvironment] = useState<IEnvironment>();
  const environmentRef = useRef<IEnvironment>({});

  const setupBackground = useCallback((scene, gl) => {
    const backgroundGeometry = new IcosahedronBufferGeometry(10, 2);
    const backgroundMaterial = new ShaderMaterial({
      uniforms: {
        color1: { value: new Color(0x61b0b7) }, // 0xeff0fb
        color2: { value: new Color(0x0077b6) }, //90e0ef  0x0077b6
        resolution: {
          value: new Vector2(gl.drawingBufferWidth, gl.drawingBufferHeight),
        },
      },
      side: BackSide,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      depthTest: false,
    });

    const background = new Mesh(backgroundGeometry, backgroundMaterial);

    scene.add(background);
  }, []);

  const setupLights = useCallback((scene) => {
    const ambientLight = new AmbientLight(0xfafafa, 1);
    scene.add(ambientLight);

    const pointLight = new PointLight(0xfafafa, 1, 0, 1);
    pointLight.position.set(10, 10, -10);
    scene.add(pointLight);

    const pointLight2 = new PointLight(0xfafafa, 1, 0, 1);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    const spotLight = new SpotLight(0xffffff, 0.5);
    spotLight.position.set(100, 10, 0);
    spotLight.lookAt(scene.position);
    scene.add(spotLight);
  }, []);

  useEffect(() => {
    const env = environmentRef.current;

    if (!gl) {
      return;
    }

    if (!env.scene || !env.camera || !env.renderer) {
      env.scene = new Scene();
      env.camera = new PerspectiveCamera(60, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
      env.camera.position.set(2.2, 2.2, 4.1);
      env.camera.lookAt(0, 0, 0);

      env.renderer = new ExpoTHREE.Renderer({
        gl: gl as WebGLRenderingContext,
        width: gl.drawingBufferWidth,
        height: gl.drawingBufferHeight,
      });
      env.renderer.setClearColor(0x0077b6);
      env.gl = gl;
      // env.renderer.autoClear = false;

      // env.renderer.setPixelRatio(window.devicePixelRatio);

      setupLights(env.scene);
      setupBackground(env.scene, gl);
    }

    setEnvironment(env);
  }, [setupLights, gl]);

  return environment;
};
