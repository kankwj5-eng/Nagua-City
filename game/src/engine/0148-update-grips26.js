function updateGrips26(first){for(const root of polish26.grips)root.setEnabled(false);for(const m of polish26.upperArms)m.setEnabled(false);for(const m of city24.forearms)m.setEnabled(false);for(const m of city24.arms){if(m.sourceArm32)m.material=m.sourceArm32.material;m.setEnabled(!!first);}}

// Signed velocity includes the player; pedestrians wait at the curb, never midway across a road.
