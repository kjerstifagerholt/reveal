//=====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming  
// in October 2019. It is suited for flexible and customizable visualization of   
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,   
// based on the experience when building Petrel.  
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//=====================================================================================

import { BaseLogSample } from "../Samples/BaseLogSample";
import { DiscreteLogSample } from "../Samples/DiscreteLogSample";
import { BaseLog } from "../Logs/BaseLog";
import { Range1 } from "../../../Core/Geometry/Range1";
import { Random } from "../../../Core/PrimitiveClasses/Random";

export class DiscreteLog extends BaseLog
{
  //==================================================
  // OVERRIDES of BaseLog
  //==================================================

  public /*override*/ getSampleByMd(md: number): BaseLogSample | null
  {
    return this.getConcreteSampleByMd(md);
  }

  //==================================================
  // INSTANCE METHODS: Getter
  //==================================================

  public getRange(): Range1
  {
    const range = new Range1();
    this.expandRange(range);
    return range;
  }

  public getAt(index: number): DiscreteLogSample { return this.samples[index] as DiscreteLogSample; }

  public getConcreteSampleByMd(md: number): DiscreteLogSample | null
  {
    const floatIndex = this.getFloatIndexAtMd(md);
    if (floatIndex < 0)
      return null;

    const index = Math.floor(floatIndex);
    return this.samples[index] as DiscreteLogSample;
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public expandRange(range: Range1): void
  {
    for (const baseSample of this.samples) 
    {
      const sample = baseSample as DiscreteLogSample;
      if (sample)
        range.add(sample.value);
    }
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public static createByRandom(mdRange: Range1, valueRange: Range1): DiscreteLog
  {
    const log = new DiscreteLog();
    const numSamples = 1000;
    const mdInc = mdRange.delta / numSamples;
    let md = mdRange.min;

    for (let k = 0; k < numSamples; k++, md += mdInc)
      log.samples.push(new DiscreteLogSample(Random.getInt(valueRange), md));
    return log;
  }

}  
