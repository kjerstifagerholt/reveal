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

import { DiscreteLog } from "@/Nodes/Wells/Logs/DiscreteLog";
import { BaseLogNode } from "@/Nodes/Wells/Wells/BaseLogNode";
import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { WellRenderStyle } from "@/Nodes/Wells/Wells/WellRenderStyle";
import { TargetId } from "@/Core/Primitives/TargetId";
import { WellLogType } from "@/Nodes/Wells/Logs/WellLogType";
import DiscreteLogNodeIcon from "@images/Nodes/DiscreteLogNode.png";

export class DiscreteLogNode extends BaseLogNode
{
  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get data(): DiscreteLog | null { return this._data as DiscreteLog; }
  public set data(value: DiscreteLog | null) { this._data = value; }
  public get renderStyle(): WellRenderStyle | null { return this.getRenderStyle() as WellRenderStyle; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return DiscreteLogNode.name; }
  public /*override*/ isA(className: string): boolean { return className === DiscreteLogNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "DiscreteLog" }
  public /*override*/ get icon(): string { return DiscreteLogNodeIcon }
  public /*override*/ hasIconColor(): boolean { return false; }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new WellRenderStyle(targetId);
  }

  //==================================================
  // OVERRIDES of BaseLogNode
  //==================================================

  public /*override*/  get wellLogType(): WellLogType { return WellLogType.Discrete; }
}