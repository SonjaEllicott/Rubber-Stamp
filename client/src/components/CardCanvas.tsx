import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Transformer } from 'react-konva';
import type Konva from 'konva';
import { useAppStore } from '../store/useAppStore';

// Playing card proportions: 2.5" × 3.5" → 250×350px (scaled to fit)
const CARD_RATIO = 2.5 / 3.5;
const CARD_CORNER = 12;

function useCardSize(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 250, height: 350 });

  useEffect(() => {
    const update = () => {
      const el = containerRef.current;
      if (!el) return;
      const maxH = el.clientHeight - 32;
      const maxW = el.clientWidth - 32;
      const byWidth = { width: maxW, height: maxW / CARD_RATIO };
      const byHeight = { width: maxH * CARD_RATIO, height: maxH };
      setSize(byWidth.height <= maxH ? byWidth : byHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [containerRef]);

  return size;
}

interface StampImageProps {
  placed: {
    id: string;
    stampId: string;
    x: number;
    y: number;
    rotation: number;
    scale: number;
    tint: string;
    opacity: number;
    flipX: boolean;
  };
  cardWidth: number;
  cardHeight: number;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (rotation: number, scale: number) => void;
  stampSrc: string;
  toolMode: string;
  onErase: () => void;
}

function StampImage({
  placed,
  cardWidth,
  cardHeight,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
  stampSrc,
  toolMode,
  onErase,
}: StampImageProps) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    const image = new window.Image();
    image.src = stampSrc;
    image.onload = () => setImg(image);
  }, [stampSrc]);

  useEffect(() => {
    if (isSelected && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const STAMP_BASE = 80; // px at scale=1

  const px = placed.x * cardWidth;
  const py = placed.y * cardHeight;

  if (!img) return null;

  return (
    <>
      <KonvaImage
        ref={imageRef}
        image={img}
        x={px}
        y={py}
        width={STAMP_BASE * placed.scale}
        height={STAMP_BASE * placed.scale}
        offsetX={(STAMP_BASE * placed.scale) / 2}
        offsetY={(STAMP_BASE * placed.scale) / 2}
        rotation={placed.rotation}
        opacity={placed.opacity}
        scaleX={placed.flipX ? -1 : 1}
        draggable={toolMode === 'select'}
        onClick={() => {
          if (toolMode === 'erase') {
            onErase();
          } else {
            onSelect();
          }
        }}
        onTap={() => {
          if (toolMode === 'erase') {
            onErase();
          } else {
            onSelect();
          }
        }}
        onDragEnd={(e) => {
          const node = e.target;
          onDragEnd(node.x() / cardWidth, node.y() / cardHeight);
        }}
        onTransformEnd={(e) => {
          const node = e.target as Konva.Image;
          const newScale = (node.scaleX() * placed.scale * node.width()) / STAMP_BASE;
          node.scaleX(1);
          node.scaleY(1);
          onTransformEnd(node.rotation(), newScale);
        }}
        filters={[]}
        cursor={toolMode === 'erase' ? 'crosshair' : toolMode === 'select' ? 'move' : 'default'}
      />
      {isSelected && toolMode === 'select' && (
        <Transformer
          ref={transformerRef}
          rotateEnabled
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(_, newBox) => newBox}
        />
      )}
    </>
  );
}

export default function CardCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: cardWidth, height: cardHeight } = useCardSize(containerRef);

  const {
    activeDesign,
    stampLibrary,
    activeStampId,
    selectedPlacedId,
    setSelectedPlacedId,
    placeStamp,
    updatePlacedStamp,
    removePlacedStamp,
    toolMode,
  } = useAppStore();

  const handleStageEvent = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const isBackground = e.target === e.target.getStage() || e.target.name() === 'card-bg';
      if (toolMode === 'stamp' && activeStampId && isBackground) {
        const stage = e.target.getStage()!;
        const pos = stage.getPointerPosition()!;
        placeStamp(activeStampId, pos.x / cardWidth, pos.y / cardHeight);
      } else if (isBackground) {
        setSelectedPlacedId(null);
      }
    },
    [toolMode, activeStampId, placeStamp, setSelectedPlacedId, cardWidth, cardHeight]
  );

  const getCursor = () => {
    if (toolMode === 'stamp' && activeStampId) return 'crosshair';
    if (toolMode === 'erase') return 'cell';
    return 'default';
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-[#0a0912] overflow-hidden"
      style={{ minHeight: 0 }}
    >
      <div
        style={{
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
          borderRadius: CARD_CORNER,
          cursor: getCursor(),
        }}
      >
        <Stage
          width={cardWidth}
          height={cardHeight}
          onClick={handleStageEvent}
          onTap={handleStageEvent}
        >
          <Layer>
            {/* Card background */}
            <Rect
              name="card-bg"
              x={0}
              y={0}
              width={cardWidth}
              height={cardHeight}
              fill={activeDesign.background}
              cornerRadius={CARD_CORNER}
            />

            {/* Placed stamps */}
            {activeDesign.placedStamps.map((placed) => {
              const stamp = stampLibrary.find((s) => s.id === placed.stampId);
              if (!stamp) return null;
              return (
                <StampImage
                  key={placed.id}
                  placed={placed}
                  cardWidth={cardWidth}
                  cardHeight={cardHeight}
                  isSelected={selectedPlacedId === placed.id}
                  stampSrc={stamp.src}
                  toolMode={toolMode}
                  onSelect={() => setSelectedPlacedId(placed.id)}
                  onErase={() => removePlacedStamp(placed.id)}
                  onDragEnd={(nx, ny) =>
                    updatePlacedStamp(placed.id, { x: nx, y: ny })
                  }
                  onTransformEnd={(rotation, scale) =>
                    updatePlacedStamp(placed.id, { rotation, scale })
                  }
                />
              );
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
