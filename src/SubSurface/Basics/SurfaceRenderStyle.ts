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

import * as Lodash from "lodash";
import { TargetId } from "@/Core/Primitives/TargetId";
import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { BaseStyle } from "@/Core/Styles/BaseStyle";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";
import { NumberProperty } from "@/Core/Property/Concrete/Property/NumberProperty";
import { ColorTypeProperty } from "@/Core/Property/Concrete/Property/ColorTypeProperty";
import { SliderProperty } from "@/Core/Property/Concrete/Property/SliderProperty";
import BooleanProperty from "@/Core/Property/Concrete/Property/BooleanProperty";
import { ColorType } from "@/Core/Enums/ColorType";

export class SurfaceRenderStyle extends BaseRenderStyle
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public showContours = new BooleanProperty({ name: "Show contours", value: true });
  public contourColorType = new ColorTypeProperty({ name: "Contour color", value: ColorType.Black });
  public increment = new NumberProperty({ name: "Increment", value: 0 });
  public showSolid = new BooleanProperty({ name: "Show solid", value: true });
  public solidColorType = new ColorTypeProperty({ name: "Solid color", value: ColorType.ColorMap });
  public solidContour = new SliderProperty({ name: "Solid contour", value: 0.5, use: true });
  public shininess = new SliderProperty({ name: "Shininess", value: 0.5, use: true });
  public opacity = new SliderProperty({ name: "Opacity", value: 0.5, use: false });

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(targetId: TargetId)
  {
    super(targetId);
  }

  //==================================================
  // OVERRIDES of BaseStyle
  //==================================================

  public /*override*/ clone(): BaseStyle { return Lodash.cloneDeep<SurfaceRenderStyle>(this); }

  protected /*override*/ populateCore(folder: BasePropertyFolder)
  {
    folder.addChild(this.showContours);
    folder.addChild(this.contourColorType);
    folder.addChild(this.increment);
    folder.addChild(this.showSolid);
    folder.addChild(this.solidColorType);
    folder.addChild(this.solidContour);
    folder.addChild(this.shininess);
    folder.addChild(this.opacity);
  }
}
