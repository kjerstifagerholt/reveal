//= ====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//= ====================================================================================

import * as Color from 'color';

import { BaseLog } from 'SubSurface/Wells/Logs/BaseLog';
import { WellNode } from 'SubSurface/Wells/Nodes/WellNode';
import { WellTrajectoryNode } from 'SubSurface/Wells/Nodes/WellTrajectoryNode';
import { WellTrajectory } from 'SubSurface/Wells/Logs/WellTrajectory';
import { WellLogType } from 'SubSurface/Wells/Logs/WellLogType';
import { BaseFilterLogNode } from 'SubSurface/Wells/Filters/BaseFilterLogNode';
import { Util } from 'Core/Primitives/Util';
import { ITarget } from 'Core/Interfaces/ITarget';
import { DataNode } from 'Core/Nodes/DataNode';
import { BasePropertyFolder } from 'Core/Property/Base/BasePropertyFolder';
import { BaseNode } from 'Core/Nodes/BaseNode';
import { ColorType } from 'Core/Enums/ColorType';
import { NodePointer } from 'Core/Nodes/Utilities/NodePointer';

export abstract class BaseLogNode extends DataNode {
  //= =================================================
  // STATIC FIELDS
  //= =================================================

  static className = 'BaseLogNode';

  //= =================================================
  // INSTANCE FIELDS
  //= =================================================

  private nodePointer = new NodePointer();

  //= =================================================
  // INSTANCE PROPERTIES
  //= =================================================

  public get log(): BaseLog | null {
    return this.anyData;
  }

  public set log(value: BaseLog | null) {
    this.anyData = value;
  }

  public get wellNode(): WellNode | null {
    return this.getAncestorByType(WellNode);
  }

  public get trajectoryNode(): WellTrajectoryNode | null {
    return this.getAncestorByType(WellTrajectoryNode);
  }

  public get trajectory(): WellTrajectory | null {
    const node = this.trajectoryNode;
    return node ? node.trajectory : null;
  }

  public get filterLogNode(): BaseFilterLogNode | null {
    const { node } = this.nodePointer;
    if (node instanceof BaseFilterLogNode) return node;

    const { trajectoryNode } = this;
    if (!trajectoryNode) return null;

    const filterLogFolder = trajectoryNode.getFilterLogFolder();
    if (!filterLogFolder) return null;

    const filterLogNode = filterLogFolder.getFilterLogNode(this);
    if (!filterLogNode) return null;

    this.nodePointer.node = filterLogNode;
    return filterLogNode;
  }

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor() {
    super();
  }

  //= =================================================
  // OVERRIDES of Identifiable
  //= =================================================

  public get /* override */ className(): string {
    return BaseLogNode.className;
  }

  public /* override */ isA(className: string): boolean {
    return className === BaseLogNode.className || super.isA(className);
  }

  //= =================================================
  // OVERRIDES of BaseNode
  //= =================================================

  public /* override */ hasIconColor(): boolean {
    return true;
  }

  public /* override */ canChangeColor(): boolean {
    return false;
  }

  public /* override */ canChangeName(): boolean {
    return this.nodePointer.isEmpty;
  }

  public /* override */ getName(): string {
    if (this.nodePointer.isEmpty) return super.getName();
    const { filterLogNode } = this;
    return filterLogNode ? filterLogNode.getName() : super.getName();
  }

  public /* override */ getColor(): Color {
    const { filterLogNode } = this;
    return filterLogNode ? filterLogNode.getColor() : super.getColor();
  }

  public /* virtual */ getCheckBoxEnabled(target?: ITarget | null): boolean {
    const { trajectoryNode } = this;
    return trajectoryNode ? trajectoryNode.isVisible(target) : false;
  }

  public /* override */ supportsColorType(
    colorType: ColorType,
    solid: boolean
  ): boolean {
    const { filterLogNode } = this;
    return filterLogNode
      ? filterLogNode.supportsColorType(colorType, solid)
      : false;
  }

  protected /* override */ populateStatisticsCore(
    folder: BasePropertyFolder
  ): void {
    super.populateStatisticsCore(folder);
    const { log } = this;
    if (!log) return;

    folder.addReadOnlyRange1('Md', log.mdRange, 2);
    folder.addReadOnlyInteger('# Samples', log.length);
  }

  public get /* override */ renderStyleRoot(): BaseNode | null {
    return this.filterLogNode;
  }

  //= =================================================
  // VIRTUAL METHODS
  //= =================================================

  public abstract get wellLogType(): WellLogType;

  //= =================================================
  // INSTANCE METHODS
  //= =================================================

  public isEqual(other: BaseFilterLogNode): boolean {
    return (
      this.wellLogType === other.wellLogType &&
      Util.equalsIgnoreCase(this.name, other.name)
    );
  }
}
