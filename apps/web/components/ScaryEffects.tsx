'use client';

import CreepyEyes from './CreepyEyes';
import GlitchEffect from './GlitchEffect';
import FloatingGhosts from './FloatingGhosts';
import CrackingScreen from './CrackingScreen';
import ShadowFigures from './ShadowFigures';
import FogEffect from './FogEffect';
import LightningFlash from './LightningFlash';
import CrawlingSpiders from './CrawlingSpiders';
import CrawlingWorms from './CrawlingWorms';

interface ScaryEffectsProps {
  enableEyes?: boolean;
  enableGlitch?: boolean;
  enableGhosts?: boolean;
  enableCracks?: boolean;
  enableShadows?: boolean;
  enableFog?: boolean;
  enableLightning?: boolean;
  enableSpiders?: boolean;
  enableWorms?: boolean;
}

export default function ScaryEffects({
  enableEyes = true,
  enableGlitch = true,
  enableGhosts = true,
  enableCracks = true,
  enableShadows = true,
  enableFog = true,
  enableLightning = true,
  enableSpiders = true,
  enableWorms = true
}: ScaryEffectsProps) {
  return (
    <>
      {enableEyes && <CreepyEyes />}
      {enableGlitch && <GlitchEffect />}
      {enableGhosts && <FloatingGhosts />}
      {enableCracks && <CrackingScreen />}
      {enableShadows && <ShadowFigures />}
      {enableFog && <FogEffect />}
      {enableLightning && <LightningFlash />}
      {enableSpiders && <CrawlingSpiders />}
      {enableWorms && <CrawlingWorms />}
    </>
  );
}
