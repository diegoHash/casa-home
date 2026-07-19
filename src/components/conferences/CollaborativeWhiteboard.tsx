import { memo, useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { Circle, Eraser, Hand, Minus, MousePointer2, Pencil, Redo2, RotateCcw, Square, Trash2, Type, Undo2, X } from 'lucide-react';
import type { WhiteboardChannel, WhiteboardWireMessage } from '../../hooks/useWhiteboardChannel';

type Tool = 'select' | 'pan' | 'pencil' | 'eraser' | 'rectangle' | 'ellipse' | 'line' | 'text';
type Point = [number, number];
type Erasure = { points: Point[]; width: number };

type BoardElement = {
  id: string;
  type: Exclude<Tool, 'select' | 'pan' | 'eraser'>;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  points?: Point[];
  text?: string;
  color: string;
  strokeWidth: number;
  version: number;
  author: string;
  erasures?: Erasure[];
};

type BoardMessage = WhiteboardWireMessage & (
  | { type: 'upsert'; element: BoardElement }
  | { type: 'delete'; id: string; version: number }
  | { type: 'clear'; version: number }
  | { type: 'stroke-start'; element: BoardElement; seq: number }
  | { type: 'stroke-points'; id: string; points: Point[]; seq: number }
  | { type: 'stroke-end'; element: BoardElement; seq: number }
  | { type: 'cursor'; x: number; y: number; name: string; color: string; identity: string }
  | { type: 'cursor-left'; identity: string });

type RemoteCursor = { x: number; y: number; name: string; color: string; updatedAt: number };
type Interaction = { mode: 'move' | 'resize'; id: string; start: Point; original: BoardElement };
type Viewport = { x: number; y: number; width: number; height: number };

const WIDTH = 1200;
const HEIGHT = 800;

function currentTimestamp() {
  return Date.now();
}

function normalizeElement(element: BoardElement) {
  return { ...element, version: currentTimestamp() };
}

function participantColor(identity: string) {
  let hash = 0;
  for (const character of identity) hash = character.charCodeAt(0) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360} 72% 45%)`;
}

function simplifyPoints(points: Point[], minimumDistance = 2.5) {
  if (points.length < 3) return points;
  const simplified: Point[] = [points[0]!];
  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = simplified.at(-1)!;
    const point = points[index]!;
    if (Math.hypot(point[0] - previous[0], point[1] - previous[1]) >= minimumDistance) simplified.push(point);
  }
  simplified.push(points.at(-1)!);
  return simplified;
}

function elementBounds(element: BoardElement) {
  const points = element.points?.length ? element.points : [[element.x1, element.y1], [element.x2, element.y2]] as Point[];
  const xs = points.map(point => point[0]);
  const ys = points.map(point => point[1]);
  return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
}

function pathTouchesElement(points: Point[], width: number, element: BoardElement) {
  const bounds = elementBounds(element);
  const margin = width / 2 + element.strokeWidth;
  return points.some(([x, y]) => x >= bounds.left - margin && x <= bounds.right + margin && y >= bounds.top - margin && y <= bounds.bottom + margin);
}

export function CollaborativeWhiteboard({ channel }: { channel: WhiteboardChannel }) {
  const room = useRoomContext();
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef<BoardElement | null>(null);
  const eraserRef = useRef<Point[] | null>(null);
  const eraserBaseElementsRef = useRef<Record<string, BoardElement> | null>(null);
  const eraserFrameRef = useRef<number | null>(null);
  const interactionRef = useRef<Interaction | null>(null);
  const pointersRef = useRef(new Map<number, Point>());
  const panRef = useRef<{ centroid: Point; viewport: Viewport; distance?: number; anchor?: Point } | null>(null);
  const lastCursorSentAt = useRef(0);
  const lastElementSentAt = useRef(0);
  const lastPointSentIndex = useRef(0);
  const incomingFrameRef = useRef<number | null>(null);
  const localFrameRef = useRef<number | null>(null);
  const pendingCursorRef = useRef<Record<string, RemoteCursor>>({});
  const remoteCursorsRef = useRef<Record<string, RemoteCursor>>({});
  const cursorNodesRef = useRef(new Map<string, SVGGElement>());
  const elementsRef = useRef<Record<string, BoardElement>>({});
  const activeStrokesRef = useRef<Record<string, BoardElement>>({});
  const eraserPreviewRef = useRef<Point[]>([]);
  const renderLiveLayerRef = useRef<() => void>(() => undefined);
  const deletedRef = useRef<Record<string, number>>({});
  const [elements, setElements] = useState<Record<string, BoardElement>>({});
  const [deleted, setDeleted] = useState<Record<string, number>>({});
  const [tool, setTool] = useState<Tool>('pencil');
  const [color, setColor] = useState('#0b1d33');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [eraserWidth, setEraserWidth] = useState(36);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [clearConfirmationOpen, setClearConfirmationOpen] = useState(false);
  const [history, setHistory] = useState<Record<string, BoardElement>[]>([]);
  const [future, setFuture] = useState<Record<string, BoardElement>[]>([]);
  const [remoteCursorDescriptors, setRemoteCursorDescriptors] = useState<Record<string, RemoteCursor>>({});
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, width: WIDTH, height: HEIGHT });

  const renderLiveLayer = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(rect.width * pixelRatio);
    const pixelHeight = Math.round(rect.height * pixelRatio);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const context = canvas.getContext('2d');
    if (!context) return;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    const scaleX = pixelWidth / viewport.width;
    const scaleY = pixelHeight / viewport.height;
    context.setTransform(scaleX, 0, 0, scaleY, -viewport.x * scaleX, -viewport.y * scaleY);
    for (const stroke of Object.values(activeStrokesRef.current)) {
      const points = stroke.points || [];
      if (!points.length) continue;
      context.beginPath();
      context.moveTo(points[0]![0], points[0]![1]);
      points.slice(1).forEach(point => context.lineTo(point[0], point[1]));
      context.strokeStyle = stroke.color;
      context.lineWidth = stroke.strokeWidth;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.stroke();
    }
    const eraserPoints = eraserPreviewRef.current;
    if (eraserPoints.length) {
      context.beginPath();
      context.moveTo(eraserPoints[0]![0], eraserPoints[0]![1]);
      eraserPoints.slice(1).forEach(point => context.lineTo(point[0], point[1]));
      context.strokeStyle = 'rgba(148, 163, 184, 0.45)';
      context.lineWidth = eraserWidth;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.stroke();
      context.beginPath();
      context.arc(eraserPoints[0]![0], eraserPoints[0]![1], eraserWidth / 2, 0, Math.PI * 2);
      context.fillStyle = 'rgba(148, 163, 184, 0.45)';
      context.fill();
    }
  }, [eraserWidth, viewport]);

  useEffect(() => {
    renderLiveLayerRef.current = renderLiveLayer;
    renderLiveLayer();
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(renderLiveLayer);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [renderLiveLayer]);

  const publish = useCallback((message: BoardMessage) => channel.send(message), [channel]);

  useEffect(() => { elementsRef.current = elements; }, [elements]);
  useEffect(() => { deletedRef.current = deleted; }, [deleted]);

  useEffect(() => {
    const flushVisualUpdates = () => {
      incomingFrameRef.current = null;
      if (Object.keys(pendingCursorRef.current).length) {
        const pending = pendingCursorRef.current;
        pendingCursorRef.current = {};
        let hasNewCursor = false;
        for (const [identity, cursor] of Object.entries(pending)) {
          if (!remoteCursorsRef.current[identity]) hasNewCursor = true;
          remoteCursorsRef.current[identity] = cursor;
          cursorNodesRef.current.get(identity)?.setAttribute('transform', `translate(${cursor.x} ${cursor.y})`);
        }
        if (hasNewCursor) setRemoteCursorDescriptors(current => ({ ...current, ...pending }));
      }
      renderLiveLayerRef.current();
    };
    const scheduleVisualUpdate = () => {
      if (incomingFrameRef.current === null) incomingFrameRef.current = requestAnimationFrame(flushVisualUpdates);
    };
    const receive = (wireMessage: WhiteboardWireMessage) => {
      try {
        const message = wireMessage as BoardMessage;
        if (message.type === 'cursor') {
          const identity = String(message.senderId || message.identity);
          pendingCursorRef.current[identity] = { x: message.x, y: message.y, name: String(message.senderName || message.name), color: message.color, updatedAt: currentTimestamp() };
          scheduleVisualUpdate();
          return;
        }
        if (message.type === 'cursor-left') {
          delete remoteCursorsRef.current[message.identity];
          cursorNodesRef.current.delete(message.identity);
          setRemoteCursorDescriptors(current => { const next = { ...current }; delete next[message.identity]; return next; });
          return;
        }
        if (message.type === 'clear') {
          activeStrokesRef.current = {};
          renderLiveLayerRef.current();
          setElements({});
          setDeleted({});
          return;
        }
        if (message.type === 'stroke-start') {
          activeStrokesRef.current[message.element.id] = { ...message.element, points: message.element.points || [] };
          scheduleVisualUpdate();
          return;
        }
        if (message.type === 'stroke-points') {
          const stroke = activeStrokesRef.current[message.id];
          if (!stroke) return;
          activeStrokesRef.current[message.id] = { ...stroke, points: [...(stroke.points || []), ...message.points].slice(-700) };
          scheduleVisualUpdate();
          return;
        }
        if (message.type === 'stroke-end') {
          delete activeStrokesRef.current[message.element.id];
          scheduleVisualUpdate();
          setElements(current => ({ ...current, [message.element.id]: message.element }));
          return;
        }
        if (message.type === 'delete') {
          setDeleted(current => ({ ...current, [message.id]: Math.max(current[message.id] ?? 0, message.version) }));
          setElements(current => {
            if ((current[message.id]?.version ?? 0) > message.version) return current;
            const next = { ...current };
            delete next[message.id];
            return next;
          });
          return;
        }
        if (message.type === 'upsert') {
          setElements(current => {
            const existingVersion = current[message.element.id]?.version ?? 0;
            const deletedVersion = deletedRef.current[message.element.id] ?? 0;
            if (Math.max(existingVersion, deletedVersion) >= message.element.version) return current;
            return { ...current, [message.element.id]: message.element };
          });
        }
      } catch {
        // Ignore malformed messages without affecting the conference.
      }
    };
    const unsubscribe = channel.subscribe(receive);
    return () => {
      unsubscribe();
      if (incomingFrameRef.current !== null) cancelAnimationFrame(incomingFrameRef.current);
    };
  }, [channel]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const cutoff = currentTimestamp() - 4_000;
      const next = Object.fromEntries(Object.entries(remoteCursorsRef.current).filter(([, cursor]) => cursor.updatedAt >= cutoff));
      if (Object.keys(next).length !== Object.keys(remoteCursorsRef.current).length) {
        remoteCursorsRef.current = next;
        setRemoteCursorDescriptors(current => Object.fromEntries(Object.entries(current).filter(([identity]) => Boolean(next[identity]))));
      }
    }, 2_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const selectPan = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key.toLowerCase() === 't') setTool('pan');
    };
    window.addEventListener('keydown', selectPan);
    return () => window.removeEventListener('keydown', selectPan);
  }, []);

  const pointFromEvent = (event: { clientX: number; clientY: number }): Point => {
    const rect = svgRef.current!.getBoundingClientRect();
    return [viewport.x + ((event.clientX - rect.left) / rect.width) * viewport.width, viewport.y + ((event.clientY - rect.top) / rect.height) * viewport.height];
  };

  const centroid = (): Point => {
    const points = [...pointersRef.current.values()];
    return [points.reduce((sum, point) => sum + point[0], 0) / points.length, points.reduce((sum, point) => sum + point[1], 0) / points.length];
  };

  const pointerDistance = () => {
    const [first, second] = [...pointersRef.current.values()];
    return first && second ? Math.hypot(second[0] - first[0], second[1] - first[1]) : 0;
  };

  const boardPointFromClient = (point: Point, sourceViewport = viewport): Point => {
    const rect = svgRef.current!.getBoundingClientRect();
    return [sourceViewport.x + ((point[0] - rect.left) / rect.width) * sourceViewport.width, sourceViewport.y + ((point[1] - rect.top) / rect.height) * sourceViewport.height];
  };

  const cancelProvisionalStroke = () => {
    const provisional = drawingRef.current;
    if (!provisional) return;
    drawingRef.current = null;
    delete activeStrokesRef.current[provisional.id];
    renderLiveLayerRef.current();
    setElements(current => { const next = { ...current }; delete next[provisional.id]; return next; });
    publish({ type: 'delete', id: provisional.id, version: currentTimestamp() });
  };

  const saveHistory = () => {
    setHistory(current => [...current.slice(-39), elements]);
    setFuture([]);
  };

  const previewEraser = () => {
    if (eraserFrameRef.current !== null) return;
    eraserFrameRef.current = requestAnimationFrame(() => {
      eraserFrameRef.current = null;
      const path = eraserRef.current;
      const base = eraserBaseElementsRef.current;
      if (!path?.length || !base) return;
      const next = { ...base };
      for (const element of Object.values(base)) {
        if (!pathTouchesElement(path, eraserWidth, element)) continue;
        next[element.id] = normalizeElement({ ...element, erasures: [...(element.erasures || []).slice(-79), { points: simplifyPoints(path, 3), width: eraserWidth }] });
      }
      elementsRef.current = next;
      setElements(next);
    });
  };

  const startDrawing = (event: ReactPointerEvent<SVGSVGElement>) => {
    event.preventDefault();
    pointersRef.current.set(event.pointerId, [event.clientX, event.clientY]);
    event.currentTarget.setPointerCapture(event.pointerId);
    if (pointersRef.current.size >= 2) {
      cancelProvisionalStroke();
      if (eraserBaseElementsRef.current) {
        elementsRef.current = eraserBaseElementsRef.current;
        setElements(eraserBaseElementsRef.current);
        eraserBaseElementsRef.current = null;
      }
      if (eraserFrameRef.current !== null) cancelAnimationFrame(eraserFrameRef.current);
      eraserFrameRef.current = null;
      eraserRef.current = null;
      eraserPreviewRef.current = [];
      renderLiveLayerRef.current();
      const center = centroid();
      panRef.current = { centroid: center, viewport, distance: pointerDistance(), anchor: boardPointFromClient(center, viewport) };
      return;
    }
    if (tool === 'pan') {
      panRef.current = { centroid: [event.clientX, event.clientY], viewport };
      return;
    }
    if (tool === 'select') return;
    const [x, y] = pointFromEvent(event);
    if (tool === 'eraser') {
      saveHistory();
      eraserBaseElementsRef.current = elementsRef.current;
      eraserRef.current = [[x, y]];
      eraserPreviewRef.current = [[x, y]];
      renderLiveLayerRef.current();
      return;
    }
    if (tool === 'text') {
      saveHistory();
      const element = normalizeElement({ id: crypto.randomUUID(), type: 'text', x1: x, y1: y, x2: x + 300, y2: y + 100, text: '', color, strokeWidth, version: 0, author: room.localParticipant.identity });
      setElements(current => ({ ...current, [element.id]: element }));
      setSelectedId(element.id);
      setEditingTextId(element.id);
      setTool('select');
      return;
    }
    saveHistory();
    event.currentTarget.setPointerCapture(event.pointerId);
    const element: BoardElement = {
      id: crypto.randomUUID(), type: tool, x1: x, y1: y, x2: x, y2: y,
      points: tool === 'pencil' ? [[x, y]] : undefined,
      color, strokeWidth, version: currentTimestamp(), author: room.localParticipant.identity,
    };
    drawingRef.current = element;
    if (tool === 'pencil') {
      lastPointSentIndex.current = 1;
      activeStrokesRef.current[element.id] = element;
      renderLiveLayerRef.current();
      publish({ type: 'stroke-start', element, seq: 0 });
    } else {
      setElements(current => ({ ...current, [element.id]: element }));
    }
  };

  const continueDrawing = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (pointersRef.current.has(event.pointerId)) pointersRef.current.set(event.pointerId, [event.clientX, event.clientY]);
    if (panRef.current && (tool === 'pan' || pointersRef.current.size >= 2)) {
      const currentCentroid = pointersRef.current.size >= 2 ? centroid() : [event.clientX, event.clientY] as Point;
      const rect = svgRef.current!.getBoundingClientRect();
      if (pointersRef.current.size >= 2 && panRef.current.distance && panRef.current.anchor) {
        const ratio = panRef.current.distance / Math.max(pointerDistance(), 1);
        const width = Math.min(WIDTH * 2, Math.max(WIDTH * 0.25, panRef.current.viewport.width * ratio));
        const height = Math.min(HEIGHT * 2, Math.max(HEIGHT * 0.25, panRef.current.viewport.height * ratio));
        const horizontalPosition = (currentCentroid[0] - rect.left) / rect.width;
        const verticalPosition = (currentCentroid[1] - rect.top) / rect.height;
        setViewport({ x: panRef.current.anchor[0] - horizontalPosition * width, y: panRef.current.anchor[1] - verticalPosition * height, width, height });
        return;
      }
      const dx = (currentCentroid[0] - panRef.current.centroid[0]) * panRef.current.viewport.width / rect.width;
      const dy = (currentCentroid[1] - panRef.current.centroid[1]) * panRef.current.viewport.height / rect.height;
      setViewport({ ...panRef.current.viewport, x: panRef.current.viewport.x - dx, y: panRef.current.viewport.y - dy });
      return;
    }
    const [cursorX, cursorY] = pointFromEvent(event);
    if (currentTimestamp() - lastCursorSentAt.current >= 45) {
      lastCursorSentAt.current = currentTimestamp();
      publish({ type: 'cursor', x: cursorX, y: cursorY, name: room.localParticipant.name || 'Participante', color: participantColor(room.localParticipant.identity), identity: room.localParticipant.identity });
    }

    if (eraserRef.current) {
      const last = eraserRef.current.at(-1)!;
      if (Math.hypot(cursorX - last[0], cursorY - last[1]) >= 3) {
        const nextPath = [...eraserRef.current, [cursorX, cursorY] as Point].slice(-500);
        eraserRef.current = nextPath;
        eraserPreviewRef.current = nextPath;
        renderLiveLayerRef.current();
        previewEraser();
      }
      return;
    }

    const interaction = interactionRef.current;
    if (interaction) {
      const dx = cursorX - interaction.start[0];
      const dy = cursorY - interaction.start[1];
      const original = interaction.original;
      let updated: BoardElement;
      if (interaction.mode === 'move') {
        updated = {
          ...original,
          x1: original.x1 + dx, y1: original.y1 + dy,
          x2: original.x2 + dx, y2: original.y2 + dy,
          points: original.points?.map(([x, y]) => [x + dx, y + dy]),
          version: currentTimestamp(),
        };
      } else {
        updated = { ...original, x2: original.x2 + dx, y2: original.y2 + dy, version: currentTimestamp() };
      }
      elementsRef.current = { ...elementsRef.current, [updated.id]: updated };
      setElements(value => ({ ...value, [updated.id]: updated }));
      if (currentTimestamp() - lastElementSentAt.current >= 120) {
        lastElementSentAt.current = currentTimestamp();
        publish({ type: 'upsert', element: updated });
      }
      return;
    }

    const current = drawingRef.current;
    if (!current) return;
    const [x, y] = [cursorX, cursorY];
    const points = current.points;
    if (current.type === 'pencil' && points) {
      const last = points.at(-1)!;
      if (Math.hypot(x - last[0], y - last[1]) < 3 || points.length >= 350) return;
      current.points = [...points, [x, y]];
    }
    current.x2 = x;
    current.y2 = y;
    current.version = currentTimestamp();
    drawingRef.current = { ...current };
    if (current.type === 'pencil') {
      activeStrokesRef.current[current.id] = { ...current };
      if (localFrameRef.current === null) {
        localFrameRef.current = requestAnimationFrame(() => {
          localFrameRef.current = null;
          renderLiveLayerRef.current();
        });
      }
    } else {
      setElements(value => ({ ...value, [current.id]: { ...current } }));
    }
    if (current.type === 'pencil' && currentTimestamp() - lastElementSentAt.current >= 48) {
      lastElementSentAt.current = currentTimestamp();
      const nextPoints = (current.points || []).slice(lastPointSentIndex.current);
      lastPointSentIndex.current = current.points?.length || 0;
      if (nextPoints.length) publish({ type: 'stroke-points', id: current.id, points: nextPoints, seq: lastPointSentIndex.current });
    } else if (current.type !== 'pencil' && currentTimestamp() - lastElementSentAt.current >= 120) {
      lastElementSentAt.current = currentTimestamp();
      publish({ type: 'upsert', element: { ...current } });
    }
  };

  const finishDrawing = (event?: ReactPointerEvent<SVGSVGElement>) => {
    if (event) pointersRef.current.delete(event.pointerId);
    if (panRef.current && (tool === 'pan' || pointersRef.current.size < 2)) {
      panRef.current = null;
      if (tool === 'pan') return;
    }
    if (eraserRef.current) {
      const path = simplifyPoints(eraserRef.current, 3);
      eraserRef.current = null;
      if (eraserFrameRef.current !== null) cancelAnimationFrame(eraserFrameRef.current);
      eraserFrameRef.current = null;
      eraserPreviewRef.current = [];
      renderLiveLayerRef.current();
      const base = eraserBaseElementsRef.current || elementsRef.current;
      eraserBaseElementsRef.current = null;
      const next = { ...base };
      for (const element of Object.values(base)) {
        if (!pathTouchesElement(path, eraserWidth, element)) continue;
        const updated = normalizeElement({ ...element, erasures: [...(element.erasures || []).slice(-79), { points: path, width: eraserWidth }] });
        next[element.id] = updated;
        publish({ type: 'upsert', element: updated });
      }
      elementsRef.current = next;
      setElements(next);
      return;
    }
    const interaction = interactionRef.current;
    if (interaction) {
      const element = elementsRef.current[interaction.id];
      interactionRef.current = null;
      if (element) publish({ type: 'upsert', element: normalizeElement(element) });
      return;
    }
    const element = drawingRef.current;
    if (!element) return;
    element.version = currentTimestamp();
    if (element.type === 'pencil' && element.points) element.points = simplifyPoints(element.points);
    drawingRef.current = null;
    if (element.type === 'pencil') {
      delete activeStrokesRef.current[element.id];
      renderLiveLayerRef.current();
    }
    setElements(current => ({ ...current, [element.id]: { ...element } }));
    publish(element.type === 'pencil' ? { type: 'stroke-end', element, seq: element.points?.length || 0 } : { type: 'upsert', element });
  };

  const startInteraction = (event: ReactPointerEvent, element: BoardElement, mode: 'move' | 'resize') => {
    if (tool !== 'select') return;
    event.stopPropagation();
    saveHistory();
    setSelectedId(element.id);
    interactionRef.current = { mode, id: element.id, start: pointFromEvent(event), original: { ...element, points: element.points?.map(point => [...point] as Point) } };
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const updateText = (id: string, text: string) => {
    setElements(current => {
      const element = current[id];
      if (!element || element.type !== 'text') return current;
      const updated = { ...element, text: text.slice(0, 1000), version: currentTimestamp() };
      elementsRef.current = { ...elementsRef.current, [id]: updated };
      return { ...current, [id]: updated };
    });
  };

  const finishTextEditing = (id: string) => {
    const element = elementsRef.current[id];
    setEditingTextId(null);
    if (!element) return;
    if (!element.text?.trim()) {
      const version = currentTimestamp();
      setElements(current => { const next = { ...current }; delete next[id]; return next; });
      publish({ type: 'delete', id, version });
      setSelectedId(null);
      return;
    }
    const updated = normalizeElement({ ...element, text: element.text.trim() });
    setElements(current => ({ ...current, [id]: updated }));
    publish({ type: 'upsert', element: updated });
  };

  const clearBoard = () => {
    saveHistory();
    setElements({});
    setDeleted({});
    publish({ type: 'clear', version: currentTimestamp() });
    setClearConfirmationOpen(false);
  };

  const undo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    setFuture(current => [elements, ...current].slice(0, 40));
    setHistory(current => current.slice(0, -1));
    setElements(previous);
    publish({ type: 'clear', version: currentTimestamp() });
    Object.values(previous).forEach(element => publish({ type: 'upsert', element: normalizeElement(element) }));
  };

  const redo = () => {
    const next = future[0];
    if (!next) return;
    setHistory(current => [...current, elements].slice(-40));
    setFuture(current => current.slice(1));
    setElements(next);
    publish({ type: 'clear', version: currentTimestamp() });
    Object.values(next).forEach(element => publish({ type: 'upsert', element: normalizeElement(element) }));
  };

  return (
    <section data-render-engine="hybrid-canvas-svg" className="relative flex min-h-0 flex-1 select-none flex-col overflow-hidden rounded-2xl bg-[#f8f6f1] text-[#0b1d33]" onContextMenu={event => event.preventDefault()}>
      <div className="grid shrink-0 grid-cols-8 items-center gap-1 overflow-y-auto border-b border-slate-200 bg-white p-1.5 sm:flex sm:max-h-none sm:flex-nowrap sm:gap-2 sm:overflow-x-auto sm:p-3">
        <ToolButton tool="select" current={tool} setTool={setTool} label="Seleccionar" icon={MousePointer2} />
        <ToolButton tool="pan" current={tool} setTool={setTool} label="Mover (T)" icon={Hand} />
        <ToolButton tool="pencil" current={tool} setTool={setTool} label="Dibujar" icon={Pencil} />
        <ToolButton tool="eraser" current={tool} setTool={setTool} label="Borrador" icon={Eraser} />
        <ToolButton tool="rectangle" current={tool} setTool={setTool} label="Rectángulo" icon={Square} />
        <ToolButton tool="ellipse" current={tool} setTool={setTool} label="Círculo" icon={Circle} />
        <ToolButton tool="line" current={tool} setTool={setTool} label="Línea" icon={Minus} />
        <ToolButton tool="text" current={tool} setTool={setTool} label="Texto" icon={Type} />
        <span className="mx-1 hidden h-7 w-px bg-slate-200 sm:block" />
        <input type="color" value={color} onChange={event => setColor(event.target.value)} aria-label="Color" className="h-8 w-full min-w-0 cursor-pointer rounded-lg border-0 bg-transparent p-0 sm:h-9 sm:w-9" />
        <select value={tool === 'eraser' ? eraserWidth : strokeWidth} onChange={event => tool === 'eraser' ? setEraserWidth(Number(event.target.value)) : setStrokeWidth(Number(event.target.value))} aria-label={tool === 'eraser' ? 'Tamaño del borrador' : 'Grosor'} className="col-span-3 h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2 pr-8 text-base sm:col-auto sm:h-10 sm:min-w-36 sm:px-3 sm:pr-9 sm:text-sm">
          {tool === 'eraser' ? <><option value={18}>Borrador pequeño</option><option value={36}>Borrador medio</option><option value={64}>Borrador grande</option></> : <><option value={2}>Fino</option><option value={4}>Medio</option><option value={7}>Grueso</option></>}
        </select>
        <button type="button" onClick={undo} disabled={!history.length} title="Deshacer" aria-label="Deshacer" className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-slate-100 px-2 disabled:opacity-35 sm:h-10 sm:min-w-10 sm:px-3"><Undo2 size={19} /></button>
        <button type="button" onClick={redo} disabled={!future.length} title="Rehacer" aria-label="Rehacer" className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-slate-100 px-2 disabled:opacity-35 sm:h-10 sm:min-w-10 sm:px-3"><Redo2 size={19} /></button>
        <button type="button" onClick={() => setViewport({ x: 0, y: 0, width: WIDTH, height: HEIGHT })} title="Centrar vista" className="inline-flex h-8 min-w-0 items-center justify-center rounded-lg bg-slate-100 px-1 sm:h-9 sm:px-2.5"><RotateCcw size={17} /></button>
        <button type="button" onClick={() => setClearConfirmationOpen(true)} title="Limpiar pizarra" className="inline-flex h-8 min-w-0 items-center justify-center rounded-lg bg-red-50 px-1 text-red-600 sm:ml-auto sm:h-9 sm:shrink-0 sm:px-2.5"><Trash2 size={17} /><span className="ml-2 hidden sm:inline">Limpiar</span></button>
      </div>
      <div className="relative min-h-0 flex-1 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]">
      <svg
        ref={svgRef}
        viewBox={`${viewport.x} ${viewport.y} ${viewport.width} ${viewport.height}`}
        preserveAspectRatio="none"
        className={`absolute inset-0 h-full w-full touch-none ${tool === 'pan' ? 'cursor-grab active:cursor-grabbing' : tool === 'select' ? 'cursor-default' : 'cursor-crosshair'}`}
        onPointerDown={startDrawing}
        onPointerMove={continueDrawing}
        onPointerUp={finishDrawing}
        onPointerCancel={finishDrawing}
        onLostPointerCapture={finishDrawing}
      >
        {Object.values(elements).map(element => (
          <BoardShape key={element.id} element={element} selected={selectedId === element.id} erasing={tool === 'eraser'} editing={editingTextId === element.id} onMove={event => startInteraction(event, element, 'move')} onResize={event => startInteraction(event, element, 'resize')} onEdit={() => { if (tool === 'select' && element.type === 'text') { setSelectedId(element.id); setEditingTextId(element.id); } }} onTextChange={text => updateText(element.id, text)} onTextFinish={() => finishTextEditing(element.id)} />
        ))}
        {Object.entries(remoteCursorDescriptors).map(([identity, cursor]) => {
          return <g key={identity} ref={node => { if (node) cursorNodesRef.current.set(identity, node); else cursorNodesRef.current.delete(identity); }} transform={`translate(${cursor.x} ${cursor.y})`} pointerEvents="none">
            <path d="M0 0 L0 24 L7 17 L13 29 L18 26 L12 15 L23 14 Z" fill={cursor.color} stroke="white" strokeWidth="2" />
            <rect x="18" y="18" width={Math.max(70, cursor.name.length * 8 + 16)} height="28" rx="8" fill={cursor.color} />
            <text x="26" y="38" fill="white" fontSize="16" fontFamily="system-ui, sans-serif">{cursor.name}</text>
          </g>;
        })}
      </svg>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 h-full w-full" />
      </div>
      {clearConfirmationOpen && <ConfirmClearModal onCancel={() => setClearConfirmationOpen(false)} onConfirm={clearBoard} />}
    </section>
  );
}

function ToolButton({ tool, current, setTool, label, icon: Icon }: { tool: Tool; current: Tool; setTool: (tool: Tool) => void; label: string; icon: typeof Pencil }) {
  return <button type="button" onClick={() => setTool(tool)} title={label} className={`inline-flex h-8 min-w-0 items-center justify-center rounded-lg px-1 text-xs font-semibold transition sm:h-9 sm:shrink-0 sm:px-2.5 ${current === tool ? 'bg-[#0b1d33] text-white' : 'bg-slate-100 hover:bg-slate-200'}`}><Icon size={17} /><span className="ml-2 hidden lg:inline">{label}</span></button>;
}

const BoardShape = memo(function BoardShape({ element, selected, erasing, editing, onMove, onResize, onEdit, onTextChange, onTextFinish }: { element: BoardElement; selected: boolean; erasing: boolean; editing: boolean; onMove: (event: ReactPointerEvent) => void; onResize: (event: ReactPointerEvent) => void; onEdit: () => void; onTextChange: (text: string) => void; onTextFinish: () => void }) {
  const interaction = erasing ? undefined : onMove;
  const common = { stroke: element.color, strokeWidth: element.strokeWidth, fill: 'transparent', onPointerDown: interaction, className: erasing ? 'cursor-cell' : undefined };
  const selection = selected ? <rect x={Math.min(element.x1, element.x2) - 8} y={Math.min(element.y1, element.y2) - 8} width={Math.abs(element.x2 - element.x1) + 16} height={Math.abs(element.y2 - element.y1) + 16} fill="none" stroke="#d6af57" strokeWidth="3" strokeDasharray="8 6" pointerEvents="none" /> : null;
  let shape;
  if (element.type === 'pencil') shape = <polyline points={element.points?.map(point => point.join(',')).join(' ')} {...common} strokeLinecap="round" strokeLinejoin="round" />;
  else if (element.type === 'rectangle') shape = <rect x={Math.min(element.x1, element.x2)} y={Math.min(element.y1, element.y2)} width={Math.abs(element.x2 - element.x1)} height={Math.abs(element.y2 - element.y1)} rx="4" {...common} />;
  else if (element.type === 'ellipse') shape = <ellipse cx={(element.x1 + element.x2) / 2} cy={(element.y1 + element.y2) / 2} rx={Math.abs(element.x2 - element.x1) / 2} ry={Math.abs(element.y2 - element.y1) / 2} {...common} />;
  else if (element.type === 'line') shape = <line x1={element.x1} y1={element.y1} x2={element.x2} y2={element.y2} {...common} strokeLinecap="round" />;
  else shape = <foreignObject x={element.x1} y={element.y1} width={Math.max(160, element.x2 - element.x1)} height={Math.max(60, element.y2 - element.y1)} onPointerDown={editing ? event => event.stopPropagation() : interaction} onDoubleClick={event => { event.stopPropagation(); onEdit(); }}>
    {editing
      ? <textarea autoFocus value={element.text || ''} maxLength={1000} aria-label="Texto de la pizarra" onChange={event => onTextChange(event.target.value)} onBlur={onTextFinish} onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') event.currentTarget.blur(); }} className="h-full w-full resize-none rounded-lg border-2 border-[#d6af57] bg-white/95 p-2 text-[28px] leading-tight text-[#0b1d33] outline-none" style={{ color: element.color }} />
      : <div className="h-full w-full whitespace-pre-wrap break-words text-[28px] leading-tight" style={{ color: element.color }}>{element.text}</div>}
  </foreignObject>;
  const maskId = `eraser-mask-${element.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const erasures = element.erasures || [];
  const visibleShape = erasures.length ? <>
    <defs><mask id={maskId} maskUnits="userSpaceOnUse" x="-10000" y="-10000" width="20000" height="20000">
      <rect x="-10000" y="-10000" width="20000" height="20000" fill="white" />
      {erasures.map((erasure, index) => <g key={index}>
        <polyline points={erasure.points.map(point => point.join(',')).join(' ')} fill="none" stroke="black" strokeWidth={erasure.width} strokeLinecap="round" strokeLinejoin="round" />
        {erasure.points[0] && <circle cx={erasure.points[0][0]} cy={erasure.points[0][1]} r={erasure.width / 2} fill="black" />}
      </g>)}
    </mask></defs>
    <g mask={`url(#${maskId})`}>{shape}</g>
  </> : shape;
  const canResize = selected && element.type !== 'pencil' && element.type !== 'text';
  return <g>{visibleShape}{selection}{canResize && <circle cx={element.x2} cy={element.y2} r="11" fill="#d6af57" stroke="white" strokeWidth="3" className="cursor-nwse-resize" onPointerDown={onResize} />}</g>;
}, (previous, next) => previous.element === next.element && previous.selected === next.selected && previous.erasing === next.erasing && previous.editing === next.editing);

function ConfirmClearModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#050d18]/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="clear-board-title" onPointerDown={event => event.stopPropagation()}>
    <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0b1d33] p-5 text-white shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div><h3 id="clear-board-title" className="text-lg font-semibold">¿Limpiar toda la pizarra?</h3><p className="mt-2 text-sm leading-6 text-white/60">Se eliminarán los trazos, figuras y textos para todos los participantes.</p></div>
        <button type="button" onClick={onCancel} aria-label="Cerrar" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 hover:bg-white/10"><X size={17} /></button>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button type="button" onClick={onCancel} className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold hover:bg-white/10">Cancelar</button>
        <button type="button" onClick={onConfirm} className="rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white hover:bg-red-400">Sí, limpiar</button>
      </div>
    </div>
  </div>;
}
