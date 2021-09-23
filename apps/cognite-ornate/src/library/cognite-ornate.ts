import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { v4 as uuid } from 'uuid';
import { pdfToImage } from 'library/utils/pdfToImage';
import {
  OrnateAnnotation,
  ToolType,
  OrnateAnnotationInstance,
  OrnatePDFDocument,
  OrnateJSON,
  Drawing,
} from 'library/types';
import {
  MoveTool,
  LineTool,
  RectTool,
  TextTool,
  DefaultTool,
  CircleTool,
} from 'library/tools';
import { Tool } from 'library/tools/Tool';
import { ConnectedLine } from 'library/connectedLine';
import bgImage from 'library/assets/bg.png';

const sceneBaseWidth = window.innerWidth;
const sceneBaseHeight = window.innerHeight;

const SCALE_SENSITIVITY = 0.96;
const SCALE_MAX = 5;
const SCALE_MIN = 0.05;

export type CogniteOrnateOptions = {
  container: string;
};

export class CogniteOrnate {
  host: HTMLDivElement;
  documents: OrnatePDFDocument[] = [];
  stage: Konva.Stage;
  backgroundLayer: Konva.Layer = new Konva.Layer();
  baseLayer: Konva.Layer = new Konva.Layer();
  drawingLayer: Konva.Layer = new Konva.Layer();
  isDrawing = false;
  currentTool: Tool = new DefaultTool(this);
  connectedLineGroup: ConnectedLine[] = [];

  constructor(options: CogniteOrnateOptions) {
    const host = document.querySelector(options.container) as HTMLDivElement;
    if (!host) {
      console.error('ORNATE: Failed to get HTML element to attach to');
    }
    this.host = host;

    // Setup out stage
    this.stage = new Konva.Stage({
      container: this.host,
      width: sceneBaseWidth,
      height: sceneBaseHeight,
      scale: { x: 0.2, y: 0.2 },
    });

    // Add layers to stage
    this.stage.add(this.backgroundLayer);
    this.stage.add(this.baseLayer);
    this.stage.add(this.drawingLayer);

    // Initialise mouse events
    this.stage.on('mousedown', this.onStageMouseDown);
    this.stage.on('mousemove', this.onStageMouseMove);
    this.stage.on('mouseup', this.onStageMouseUp);
    this.stage.on('wheel', this.onStageMouseWheel);
    this.stage.on('mouseenter', () => {
      this.stage.container().style.cursor = this.currentTool.cursor;
    });
    this.currentTool.onInit();

    // Ensure responsiveness
    this.fitStageIntoParentContainer();
    window.addEventListener('resize', this.fitStageIntoParentContainer);

    this.initBackgroundLayer();
  }

  initBackgroundLayer = () => {
    const rectSize = 500000;
    const backgroundImage = new Image();
    backgroundImage.src = bgImage;
    const backgroundRect = new Konva.Rect({
      x: -rectSize / 2,
      y: -rectSize / 2,
      width: rectSize,
      height: rectSize,
      fillPatternImage: backgroundImage,
    });
    const group = new Konva.Group();
    group.add(backgroundRect);
    this.backgroundLayer.add(group);
  };

  fitStageIntoParentContainer = () => {
    const containerWidth = this.host.parentElement!.offsetWidth;
    const containerHeight = this.host.parentElement!.offsetHeight;

    this.stage.width(containerWidth);
    this.stage.height(containerHeight);
  };

  handleToolChange(tool: ToolType) {
    if (this.currentTool) {
      this.currentTool.onDestroy();
    }
    switch (tool) {
      case 'move':
        this.currentTool = new MoveTool(this);
        break;
      case 'line':
        this.currentTool = new LineTool(this);
        break;
      case 'rect':
        this.currentTool = new RectTool(this);
        break;
      case 'circle':
        this.currentTool = new CircleTool(this);
        break;
      case 'text':
        this.currentTool = new TextTool(this);
        break;
      case 'default':
        this.currentTool = new DefaultTool(this);
        break;
      default:
        this.currentTool = new DefaultTool(this);
        throw new Error(`${tool} is not an available tool.`);
    }

    this.currentTool.onInit();
    this.stage.container().style.cursor = this.currentTool.cursor;
    this.stage.on('mouseenter', () => {
      this.stage.container().style.cursor = this.currentTool.cursor;
    });
  }

  addPDFDocument = async (
    pdfURL: string,
    pageNumber: number,
    metadata: Record<string, string>,
    options?: {
      initialPosition?: { x: number; y: number };
      zoomAfterLoad?: boolean;
      groupId?: string;
    }
  ): Promise<OrnatePDFDocument> => {
    const {
      initialPosition = { x: 0, y: 0 },
      zoomAfterLoad = true,
      groupId = uuid(),
    } = options || {};
    const base64 = await pdfToImage(pdfURL, pageNumber);
    return new Promise<OrnatePDFDocument>((res, rej) => {
      const group = new Konva.Group({
        id: groupId,
      });
      this.baseLayer.add(group);
      const image = new Image();
      image.onload = () => {
        const scale =
          image.width < sceneBaseWidth ? 1 : sceneBaseWidth / image.width;
        // Draw PDF image
        const kBaseImage = new Konva.Image({
          image,
          width: image.width,
          height: image.height,
          stroke: 'black',
          strokeWidth: 1,
          attachedToGroup: group.id(),
        });
        kBaseImage.image(image);

        group.x(initialPosition?.x || 0);
        group.y(initialPosition?.y || 0);
        group.width(image.width);
        group.height(image.height);
        group.add(kBaseImage);
        kBaseImage.zIndex(1);

        const baseRect = new Konva.Rect({
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
          fill: '#E8E8E8',
        });
        group.add(baseRect);
        baseRect.zIndex(0);

        group.on('dblclick', () => {
          this.zoomTo(group);
        });

        this.baseLayer.draw();
        if (zoomAfterLoad) {
          this.zoomTo(group, 0);
        }
        const newDocument: OrnatePDFDocument = {
          image,
          scale,
          annotations: [],
          group,
          kImage: kBaseImage,
          metadata,
        };
        this.documents.push(newDocument);
        res(newDocument);
      };
      image.onerror = (e) => {
        rej(e);
      };
      image.src = base64;
    });
  };

  addAnnotationsToGroup = (
    doc: OrnatePDFDocument,
    annotations: OrnateAnnotation[]
  ): OrnateAnnotationInstance[] => {
    const rects: OrnateAnnotationInstance[] = annotations.map((annotation) => ({
      annotation,
      instance: this.annotationToRect(annotation, doc, {
        width: doc.group.width(),
        height: doc.group.height(),
      }),
      document: doc,
    }));

    if (rects.length > 0) {
      doc.group.add(...rects.map((r) => r.instance));
      rects.forEach((rect) => {
        rect.instance.zIndex(2);
        // rect.instance.cache();
      });
      this.baseLayer.draw();
    }
    return rects;
  };

  onStageMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (this.currentTool.onMouseDown) {
      this.currentTool.onMouseDown(e);
    }
  };

  onStageMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (this.currentTool.onMouseMove) {
      this.currentTool.onMouseMove(e);
    }
  };

  onStageMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    if (this.currentTool.onMouseUp) {
      this.currentTool.onMouseUp(e);
    }
    this.connectedLineGroup.forEach((l) => l.update());
  };

  onStageMouseWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const oldScale = this.stage.scaleX();

    const pointer = this.stage.getPointerPosition();
    if (!pointer) {
      return;
    }
    const mousePointTo = {
      x: (pointer.x - this.stage.x()) / oldScale,
      y: (pointer.y - this.stage.y()) / oldScale,
    };

    const newScale =
      e.evt.deltaY > 0
        ? oldScale * SCALE_SENSITIVITY
        : oldScale / SCALE_SENSITIVITY;
    if (newScale < SCALE_MIN || newScale > SCALE_MAX) {
      return;
    }

    this.stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    this.stage.position(newPos);

    // Show / Hide rectangles based on scale
    const shouldShowRects = newScale > 0.1;
    this.documents.forEach((doc) => {
      if (!shouldShowRects) {
        doc.kImage.hide();
      } else {
        doc.kImage.show();
      }
    });
  };

  connectDocuments(
    documentStart: OrnatePDFDocument,
    documentEnd: OrnatePDFDocument,
    startPoint: { x: number; y: number },
    instanceA: Konva.Node,
    instanceB?: Konva.Node
  ) {
    // Determine where to render (up, down, left or right) (renderDirection = [x, y])
    const normalizedX = startPoint.x - documentStart.kImage.x();
    const normalizedY = startPoint.y - documentStart.kImage.y();
    const xPct = normalizedX / documentStart.kImage.width();
    const yPct = normalizedY / documentStart.kImage.height();

    const inBottomLeft = xPct < yPct;
    const inTopRight = xPct > yPct;
    const inBottomRight = xPct + yPct > 1;
    const inTopLeft = xPct + yPct < 1;
    let renderDirection: [number, number] = [0, 0];
    const distanceBetween = 256;
    // Up
    if (inTopLeft && inTopRight) {
      renderDirection = [0, -1];
    }
    // Left
    if (inTopLeft && inBottomLeft) {
      renderDirection = [-1, 0];
    }
    // Down
    if (inBottomLeft && inBottomRight) {
      renderDirection = [0, 1];
    }
    // Right
    if (inTopRight && inBottomRight) {
      renderDirection = [1, 0];
    }

    const newX =
      documentStart.group.x() +
      renderDirection[0] * (documentStart.group.width() + distanceBetween);
    const newY =
      documentStart.group.y() +
      renderDirection[1] * (documentStart.group.height() + distanceBetween);
    documentEnd.group.x(newX);
    documentEnd.group.y(newY);
    this.baseLayer.draw();

    const connectedLine = new ConnectedLine(
      instanceA,
      instanceB || documentEnd.group,
      this.stage
    );
    this.baseLayer.add(connectedLine.line);
    this.connectedLineGroup.push(connectedLine);

    this.zoomToDocument(documentEnd);
  }

  zoomTo(node: Konva.Node, duration = 0.35) {
    // @ts-ignore - relativeTo DOES accept this.stage just fine.
    const rect = node.getClientRect({ relativeTo: this.stage });
    const scale = Math.min(
      this.stage.width() / rect.width,
      this.stage.height() / rect.height
    );

    const location = {
      x: -node.x() * scale,
      y: -node.y() * scale,
    };
    const { x, y } = location;
    const tween = new Konva.Tween({
      duration,
      easing: Konva.Easings.EaseInOut,
      node: this.stage,
      scaleX: scale,
      scaleY: scale,
      x,
      y,
    });
    tween.onFinish = () => tween.destroy();

    tween.play();
    this.stage.batchDraw();
  }

  zoomToDocument(doc: OrnatePDFDocument) {
    // get layers
    const node = doc.group;
    this.zoomTo(node);
  }

  getTranslatedPointerPosition() {
    const currMousePosition = this.stage.getPointerPosition();
    if (!currMousePosition) {
      return { x: 0, y: 0 };
    }
    return {
      x:
        (currMousePosition.x - this.stage.getPosition().x) /
        this.stage.scale().x,
      y:
        (currMousePosition.y - this.stage.getPosition().y) /
        this.stage.scale().y,
    };
  }

  annotationToRect(
    annotation: OrnateAnnotation,
    doc: OrnatePDFDocument,
    image: { width: number; height: number }
  ) {
    const rect = new Konva.Rect({
      x: annotation.x * image.width,
      y: annotation.y * image.height,
      width: annotation.width * image.width,
      height: annotation.height * image.height,
      stroke: annotation.stroke,
      strokeWidth: annotation.strokeWidth,
      fill: annotation.fill,
      unselectable: true,
      metadata: annotation.metadata,
    });
    if (annotation.onClick) {
      rect.on('click', () =>
        annotation.onClick!({
          instance: rect,
          annotation,
          document: doc,
        })
      );
      rect.on('mouseenter', () => {
        this.stage.container().style.cursor = 'pointer';
      });
      rect.on('mouseleave', () => {
        this.stage.container().style.cursor =
          this.currentTool?.cursor || 'default';
      });
    }
    return rect;
  }

  restart = () => {
    this.baseLayer.destroyChildren();
    this.drawingLayer.destroyChildren();
    this.documents = [];
  };

  addDrawings = (...drawings: Drawing[]) => {
    drawings.forEach((drawing) => {
      let shape = new Konva.Shape();
      if (drawing.type === 'line') {
        shape = new Konva.Line(drawing.attrs);
      }
      if (drawing.type === 'rect') {
        shape = new Konva.Rect(drawing.attrs);
      }
      if (drawing.type === 'text') {
        shape = new Konva.Text(drawing.attrs);
      }
      if (drawing.type === 'circle') {
        shape = new Konva.Circle(drawing.attrs);
      }
      if (drawing.groupId) {
        const group = this.stage.findOne<Konva.Group>(`#${drawing.groupId}`);
        if (group) {
          group.add(shape);
        }
      }
    });
  };

  exportToJSON = (): OrnateJSON => {
    return {
      documents: this.documents.map((doc) => ({
        metadata: doc.metadata || {},
        x: doc.group.x(),
        y: doc.group.y(),
        drawings: (doc.group.children || []).map((x) => ({
          type: x.attrs.type,
          attrs: x.attrs,
        })),
      })),
    };
  };
}
