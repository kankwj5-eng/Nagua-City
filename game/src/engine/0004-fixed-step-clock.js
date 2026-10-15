var FixedStepClock=class {
 constructor(step=1/60,maxElapsed=.5){this.step=step;this.maxElapsed=maxElapsed;this.accumulator=0;}
 reset(){this.accumulator=0;}
 advance(elapsed,tick){this.accumulator+=Math.min(this.maxElapsed,Math.max(0,elapsed));let steps=0;while(this.accumulator+1e-10>=this.step){tick(this.step);this.accumulator-=this.step;steps++;}return {alpha:Math.max(0,this.accumulator/this.step),steps};}
};

/* Ground vehicle bicycle model: SI units, right handed, forward -Z. */
/* SI units. Torque curves, ratios, tyre grip and losses are game approximations. */
/* SI units. Torque curves, ratios, tyre grip and losses are game approximations. */
/* SI units. Torque curves, ratios, tyre grip and losses are game approximations. */
// SI planar handling model. Vehicle specs remain game approximations; not a calibrated simulator.
