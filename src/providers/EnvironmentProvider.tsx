import React, { useState, useContext, useEffect, useCallback } from 'react';
import type { IEnvironment } from '../three/Environment';

const EnvironmentContext = React.createContext<IEnvironment>({});

export const EnvironmentProvider: React.FC<{ environment: IEnvironment }> = ({ environment, children }) => {
  const [localEnvironment, setEnvironment] = useState<IEnvironment>();

  const resizeTo = useCallback(
    (ratio = 1) => {
      const { gl } = localEnvironment;

      localEnvironment.camera.aspect = (ratio * gl.drawingBufferWidth) / gl.drawingBufferHeight;
      localEnvironment.camera.updateProjectionMatrix();
      localEnvironment.renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    },
    [localEnvironment],
  );

  useEffect(() => {
    setEnvironment(environment);
  }, [environment]);

  return <EnvironmentContext.Provider value={{ ...localEnvironment, resizeTo }}>{children}</EnvironmentContext.Provider>;
};

export const useEnvironmentContext = () => useContext(EnvironmentContext);
