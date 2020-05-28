
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ToolCommand } from "@/Three/Commands/Tools/ToolCommand";

export class ZoomToTargetToolCommand extends ToolCommand {

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(target: ThreeRenderTargetNode | null = null) {
    super(target);
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public get name(): string { return "Zoom to target" }
  public get shortcut(): string { return "S" }
}


