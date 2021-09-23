import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { ICogniteOrnateTool } from 'library/types';

import { Tool } from './Tool';

export class LineTool extends Tool implements ICogniteOrnateTool {
  cursor = 'crosshair';
  newLine: Konva.Line | null = null;
  group: Konva.Group | null = null;

  getPosition = () => {
    let { x, y } = this.ornateInstance.getTranslatedPointerPosition();
    if (this.group) {
      x -= this.group.x();
      y -= this.group.y();
    }
    return {
      x,
      y,
    };
  };

  onMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const { drawingLayer } = this.ornateInstance;
    this.ornateInstance.isDrawing = true;

    // If we're over an item with a group attachment, add it there instead.
    const groupName = e.target?.attrs?.attachedToGroup;
    const group = this.ornateInstance.stage.findOne(`#${groupName}`);
    this.group = group as Konva.Group;
    const { x: startX, y: startY } = this.getPosition();
    this.newLine = new Konva.Line({
      points: [startX, startY, startX, startY],
      stroke: 'red',
      strokeWidth: 10,
      userGenerated: true,
      type: 'line',
    });

    if (!group) {
      drawingLayer.add(this.newLine);
      drawingLayer.draw();
      return;
    }

    this.group.add(this.newLine);
  };

  onMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const { drawingLayer } = this.ornateInstance;
    if (!this.newLine) {
      return;
    }
    if (this.ornateInstance.isDrawing) {
      const { x, y } = this.getPosition();
      const currPoints = this.newLine?.points();
      // If shift, draw straight
      if (e.evt.shiftKey) {
        const isVertical =
          Math.abs(x - currPoints[0]) < Math.abs(y - currPoints[1]);
        if (isVertical) {
          this.newLine?.points([
            currPoints[0],
            currPoints[1],
            currPoints[0],
            y,
          ]);
        } else {
          this.newLine?.points([
            currPoints[0],
            currPoints[1],
            x,
            currPoints[1],
          ]);
        }
      } else {
        this.newLine.points([currPoints[0], currPoints[1], x, y]);
      }

      drawingLayer.draw();
    }
  };

  onMouseUp = () => {
    this.ornateInstance.isDrawing = false;
  };
}
