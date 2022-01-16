/* eslint-disable no-param-reassign */
import {
  DiagramInstanceId,
  DiagramLineInstance,
  getDiagramInstanceId,
  isPathIdInInstance,
  PidDocument,
  DiagramConnection,
  getInstanceByDiagramInstanceId,
  getClosestPathSegments,
  Point,
  getPointsCloserToEachOther,
  getPointTowardOtherPoint,
  connectionExists,
  getDiagramInstanceByPathId,
  DiagramInstance,
  DiagramSymbolInstance,
} from '@cognite/pid-tools';

import { ToolType } from '../../types';
import { COLORS } from '../../constants';

export const isDiagramLine = (
  node: SVGElement,
  lines: DiagramLineInstance[]
) => {
  return lines.some((line) => line.pathIds.includes(node.id));
};

export const isSymbolInstance = (
  node: SVGElement,
  symbolInstances: DiagramInstance[]
) => {
  return symbolInstances.some((symbolInst) =>
    symbolInst.pathIds.includes(node.id)
  );
};

export const isInConnectionSelection = (
  node: SVGElement,
  connectionSelection: DiagramInstanceId | null
) => {
  return isPathIdInInstance(node.id, connectionSelection);
};

export const isInAddSymbolSelection = (
  node: SVGElement,
  selection: SVGElement[]
) => {
  return selection.some((svgPath) => svgPath.id === node.id);
};

export const isInLabelSelection = (
  node: SVGElement,
  labelSelection: DiagramInstanceId | null
) => {
  return isPathIdInInstance(node.id, labelSelection);
};

export const isLabelInInstance = (
  instance: DiagramInstance,
  id: DiagramInstanceId
): boolean => {
  return instance.labelIds.includes(id);
};

export const isLabelInInstances = (
  node: SVGElement,
  instances: DiagramInstance[]
) => {
  return instances.some((instance) => isLabelInInstance(instance, node.id));
};

export const isNodeInLineNumber = (
  node: SVGElement,
  lineNumber: string | null,
  diagramInstances: DiagramInstance[]
) => {
  if (lineNumber === null) return false;

  if (node instanceof SVGTSpanElement) {
    let isInLine = false;
    diagramInstances
      .filter((instance) => {
        return instance.labelIds.includes(node.id);
      })
      .forEach((instance) => {
        if (instance.lineNumbers.includes(lineNumber)) {
          isInLine = true;
        }
      });
    return isInLine;
  }
  const diagramInstnace = getDiagramInstanceByPathId(diagramInstances, node.id);

  if (diagramInstnace === null) return false;

  return diagramInstnace.lineNumbers.includes(lineNumber);
};

export const isInGraphSelection = (
  node: SVGElement,
  graphSelection: DiagramInstanceId | null
) => {
  return isPathIdInInstance(node.id, graphSelection);
};

const colorNode = (
  node: SVGElement,
  color: string | undefined,
  opacity: number | undefined = undefined
) => {
  if (color !== undefined) {
    node.style.stroke = color;
    if (node.style.fill !== 'none') {
      node.style.fill = color;
    }
  }
  if (opacity !== undefined) {
    if (node.style.fill !== 'none') {
      node.style.opacity = opacity.toString();
    } else {
      node.style.strokeOpacity = opacity.toString();
    }
  }
};

export interface ApplyStyleArgs {
  node: SVGElement;
  selection: SVGElement[];
  connectionSelection: DiagramInstanceId | null;
  labelSelection: DiagramInstanceId | null;
  symbolInstances: DiagramSymbolInstance[];
  lines: DiagramLineInstance[];
  connections: DiagramConnection[];
  graphPaths: DiagramInstanceId[][];
  graphSelection: DiagramInstanceId | null;
  active: ToolType;
  activeLineNumber: string | null;
}

export const applyStyleToNode = ({
  node,
  selection,
  connectionSelection,
  labelSelection,
  symbolInstances,
  lines,
  connections,
  graphSelection,
  active,
  activeLineNumber,
}: ApplyStyleArgs) => {
  let color: string | undefined;
  let opacity = 1;

  if (isDiagramLine(node, lines) || isLabelInInstances(node, lines)) {
    ({ color, opacity } = COLORS.diagramLine);
  }
  if (
    isSymbolInstance(node, symbolInstances) ||
    isLabelInInstances(node, symbolInstances)
  ) {
    ({ color, opacity } = COLORS.symbol);
  }
  if (isInConnectionSelection(node, connectionSelection)) {
    colorNode(node, COLORS.connectionSelection);
    color = COLORS.connectionSelection;
  }
  if (isInLabelSelection(node, labelSelection)) {
    color = COLORS.labelSelection;
  }
  if (isInAddSymbolSelection(node, selection)) {
    ({ color, opacity } = COLORS.symbolSelection);
  }
  if (isInGraphSelection(node, graphSelection)) {
    color = COLORS.connectionSelection;
  }

  if (active === 'setLineNumber') {
    if (
      !isNodeInLineNumber(node, activeLineNumber, [
        ...symbolInstances,
        ...lines,
      ])
    ) {
      opacity = 0.23;
    } else {
      opacity = 1;
    }
  }
  colorNode(node, color, opacity);

  applyPointerCursorStyleToNode({
    node,
    active,
    connectionSelection,
    labelSelection,
    symbolInstances,
    lines,
    connections,
  });
};

interface CursorStyleOptions {
  node: SVGElement;
  active: ToolType;
  connectionSelection: DiagramInstanceId | null;
  labelSelection: DiagramInstanceId | null;
  symbolInstances: DiagramSymbolInstance[];
  lines: DiagramLineInstance[];
  connections: DiagramConnection[];
}

const applyPointerCursorStyleToNode = ({
  node,
  active,
  connectionSelection,
  labelSelection,
  symbolInstances,
  lines,
  connections,
}: CursorStyleOptions) => {
  if (active === 'addSymbol') {
    if (node instanceof SVGPathElement) {
      node.style.cursor = 'pointer';
    }
  } else if (active === 'addLine') {
    if (
      node instanceof SVGPathElement &&
      !isSymbolInstance(node, symbolInstances)
    ) {
      node.style.cursor = 'pointer';
    }
  } else if (active === 'connectInstances') {
    if (isSymbolInstance(node, symbolInstances) || isDiagramLine(node, lines)) {
      // Make sure the connection does not already exist
      if (connectionSelection !== null) {
        const symbolInstance = getDiagramInstanceByPathId(
          [...symbolInstances, ...lines],
          node.id
        )!;
        const instanceId = getDiagramInstanceId(symbolInstance);
        const newConnection = {
          start: connectionSelection,
          end: instanceId,
          direction: 'unknown',
        } as DiagramConnection;
        if (!connectionExists(connections, newConnection)) {
          node.style.cursor = 'pointer';
        }
      } else {
        node.style.cursor = 'pointer';
      }
    }
  } else if (active === 'connectLabels') {
    if (isSymbolInstance(node, symbolInstances) || isDiagramLine(node, lines)) {
      node.style.cursor = 'pointer';
    }
    if (labelSelection !== null && node instanceof SVGTSpanElement) {
      node.style.cursor = 'pointer';
    }
  } else if (active === 'setLineNumber') {
    if (isSymbolInstance(node, symbolInstances) || isDiagramLine(node, lines)) {
      node.style.cursor = 'pointer';
    }
  }
};

export function addOrRemoveLabelToInstance<Type extends DiagramInstance>(
  labelId: string,
  instance: Type,
  instances: Type[],
  setter: (arg: Type[]) => void
): void {
  if (instance.labelIds.includes(labelId)) {
    instance.labelIds = instance.labelIds.filter((li) => li !== labelId);
  } else {
    instance.labelIds = [...instance.labelIds, labelId];
  }
  setter([...instances]);
}

export function addOrRemoveLineNumberToInstance<Type extends DiagramInstance>(
  lineNumber: string,
  instance: Type,
  instances: Type[],
  setter: (arg: Type[]) => void
) {
  if (instance.lineNumbers.includes(lineNumber)) {
    instance.lineNumbers = instance.lineNumbers.filter(
      (ln) => ln !== lineNumber
    );
  } else {
    instance.lineNumbers = [...instance.lineNumbers, lineNumber];
  }
  setter([...instances]);
}

export const colorSymbol = (
  diagramInstanceId: DiagramInstanceId,
  strokeColor: string,
  diagramInstances: DiagramInstance[],
  additionalStyles?: { [key: string]: string }
) => {
  const symbolInstance = diagramInstances.filter(
    (instance) => getDiagramInstanceId(instance) === diagramInstanceId
  )[0] as DiagramInstance;

  if (symbolInstance) {
    symbolInstance.pathIds.forEach((pathId) => {
      Object.assign(
        (document.getElementById(pathId) as unknown as SVGElement).style,
        {
          ...additionalStyles,
          stroke: strokeColor,
        }
      );
    });
  }
};

export const setStrokeWidth = (
  diagramInstance: DiagramInstance,
  strokeWidth: string
) => {
  diagramInstance.pathIds.forEach((pathId) => {
    (
      document.getElementById(pathId) as unknown as SVGElement
    ).style.strokeWidth = strokeWidth;
  });
};

export const visualizeConnections = (
  svg: SVGSVGElement,
  pidDocument: PidDocument,
  connections: DiagramConnection[],
  symbolInstances: DiagramInstance[],
  lines: DiagramLineInstance[]
) => {
  const offset = 2;
  const maxLength = 10;
  const intersectionThreshold = 3;
  const instances = [...symbolInstances, ...lines];
  connections.forEach((connection) => {
    const startInstance = getInstanceByDiagramInstanceId(
      instances,
      connection.start
    );
    const endInstance = getInstanceByDiagramInstanceId(
      instances,
      connection.end
    );
    if (startInstance === undefined || endInstance === undefined) return;

    let startPoint: Point | undefined;
    let endPoint: Point | undefined;
    if (startInstance.type !== 'Line' && endInstance.type !== 'Line') {
      // Both is symbol
      startPoint = pidDocument.getMidPointToPaths(startInstance.pathIds);
      endPoint = pidDocument.getMidPointToPaths(endInstance.pathIds);

      [startPoint, endPoint] = getPointsCloserToEachOther(
        startPoint,
        endPoint,
        offset
      );
    } else if (startInstance.type === 'Line' && endInstance.type === 'Line') {
      // Both is line

      const startPathSegments = pidDocument.getPathSegmentsToPaths(
        startInstance.pathIds
      );
      const endPathSegments = pidDocument.getPathSegmentsToPaths(
        endInstance.pathIds
      );

      const [startPathSegment, endPathSegment] = getClosestPathSegments(
        startPathSegments,
        endPathSegments
      );

      const intersection = startPathSegment.getIntersection(endPathSegment);
      if (intersection === undefined) {
        startPoint = startPathSegment.midPoint;
        endPoint = endPathSegment.midPoint;
      } else {
        if (
          intersection.distance(startPathSegment.start) <
            intersectionThreshold ||
          intersection.distance(startPathSegment.stop) < intersectionThreshold
        ) {
          startPoint = getPointTowardOtherPoint(
            intersection,
            startPathSegment.midPoint,
            Math.min(
              maxLength,
              intersection.distance(startPathSegment.midPoint) - offset
            )
          );
        } else {
          startPoint = intersection;
        }

        if (
          intersection.distance(endPathSegment.start) < intersectionThreshold ||
          intersection.distance(endPathSegment.stop) < intersectionThreshold
        ) {
          endPoint = getPointTowardOtherPoint(
            intersection,
            endPathSegment.midPoint,
            Math.min(
              maxLength,
              intersection.distance(endPathSegment.midPoint) - offset
            )
          );
        } else {
          endPoint = intersection;
        }
      }
    } else {
      // One symbol and one line
      const [symbol, line] =
        startInstance.type !== 'Line'
          ? [startInstance, endInstance]
          : [endInstance, startInstance];

      const symbolPoint = pidDocument.getMidPointToPaths(symbol.pathIds);

      // Use path segment with start/stop point closest to `symbolPoint`
      let linePoint: undefined | Point;
      const linePathSegments = pidDocument.getPathSegmentsToPaths(line.pathIds);
      let minDistance = Infinity;
      linePathSegments.forEach((pathSegment) => {
        const startDistance = symbolPoint.distance(pathSegment.start);
        if (startDistance < minDistance) {
          minDistance = startDistance;
          linePoint = getPointTowardOtherPoint(
            pathSegment.start,
            pathSegment.stop,
            Math.min(
              maxLength,
              pathSegment.start.distance(pathSegment.midPoint)
            )
          );
        }

        const stopDistance = symbolPoint.distance(pathSegment.stop);
        if (stopDistance < minDistance) {
          minDistance = stopDistance;
          linePoint = getPointTowardOtherPoint(
            pathSegment.stop,
            pathSegment.start,
            Math.min(maxLength, pathSegment.stop.distance(pathSegment.midPoint))
          );
        }
      });

      startPoint = symbolPoint;
      endPoint = linePoint;
      if (endPoint === undefined) return;

      [startPoint, endPoint] = getPointsCloserToEachOther(
        startPoint,
        endPoint,
        offset
      );
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute(
      'd',
      `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`
    );

    path.setAttribute(
      'style',
      `stroke:${COLORS.connection.color};stroke-width:${COLORS.connection.strokeWidth};opacity:${COLORS.connection.opacity};stroke-linecap:round`
    );
    svg.insertBefore(path, svg.children[0]);
  });
};
