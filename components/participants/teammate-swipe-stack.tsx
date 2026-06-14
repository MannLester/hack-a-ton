"use client";

import { useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Heart, X } from "lucide-react";
import type { Teammate } from "@/components/shared/types";
import { AuthActionButton } from "@/components/shared/auth-controls";
import { useClerkAuthState } from "@/components/shared/convex-provider";

const SWIPE_THRESHOLD = 100;
const EXIT_X = 1000;

function CardContent({ teammate }: { teammate: Teammate }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-lg font-black text-zinc-950">{teammate.name}</p>
        <p className="text-sm font-bold text-zinc-500">{teammate.school}</p>
      </div>
      <span className="rounded-full bg-[#00a7e8]/15 px-3 py-1 text-xs font-black text-[#006c9c]">
        {teammate.match} match
      </span>
    </div>
  );
}

function SwipeCard({
  teammate,
  isTop,
  onSwipe,
  style,
  exitDirection,
}: {
  teammate: Teammate;
  isTop: boolean;
  onSwipe: (direction: "left" | "right") => void;
  style?: React.CSSProperties;
  exitDirection: "left" | "right" | null;
}) {
  const { isSignedIn } = useClerkAuthState();
  const canSwipe = isTop && isSignedIn;
  const exitX = exitDirection === "left" ? -EXIT_X : EXIT_X;
  const exitRotate = exitDirection === "left" ? -15 : 15;

  return (
    <motion.div
      className="absolute inset-0"
      style={style}
      drag={canSwipe ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={(_: unknown, info: PanInfo) => {
        if (!canSwipe) return;
        if (info.offset.x > SWIPE_THRESHOLD) {
          onSwipe("right");
        } else if (info.offset.x < -SWIPE_THRESHOLD) {
          onSwipe("left");
        }
      }}
      initial={{ scale: 1, y: 0, opacity: 1 }}
      animate={
        exitDirection
          ? { x: exitX, opacity: 0, rotate: exitRotate }
          : { scale: style?.scale ?? 1, y: style?.y ?? 0, opacity: style?.opacity ?? 1 }
      }
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      whileTap={canSwipe ? { cursor: "grabbing" } : undefined}
    >
      <div className="flex h-full flex-col rounded-lg border-2 border-zinc-950 bg-white p-5 shadow-[5px_5px_0_#111]">
        <CardContent teammate={teammate} />
        <p className="mt-4 text-sm font-black text-zinc-800">
          {teammate.role}
        </p>
        <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
          {teammate.goal}
        </p>
        <div className="mt-4 grid gap-2 text-sm font-bold text-zinc-600 sm:grid-cols-2">
          <span>{teammate.stack}</span>
          <span>{teammate.availability}</span>
        </div>
        <div className="mt-5 flex gap-2">
          <AuthActionButton
            action="like_teammate"
            onAuthorizedClick={() => onSwipe("left")}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border-2 border-zinc-950 bg-white text-sm font-black text-zinc-800"
          >
            <X className="size-4" /> Pass
          </AuthActionButton>
          <AuthActionButton
            action="like_teammate"
            onAuthorizedClick={() => onSwipe("right")}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#ffd21f] text-sm font-black text-zinc-950"
          >
            <Heart className="size-4" /> Like
          </AuthActionButton>
        </div>
      </div>
    </motion.div>
  );
}

export function SwipeStack({
  teammates,
  onDismiss,
  onLike,
  emptyMessage,
}: {
  teammates: Teammate[];
  onDismiss: (name: string) => void;
  onLike: (teammate: Teammate) => void;
  emptyMessage: string;
}) {
  const [cardStack, setCardStack] = useState(teammates);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(
    null,
  );
  const [exitingIndex, setExitingIndex] = useState<number | null>(null);

  const handleSwipe = (direction: "left" | "right") => {
    const topIndex = cardStack.length - 1;
    if (topIndex < 0) return;

    setExitDirection(direction);
    setExitingIndex(topIndex);

    const topCard = cardStack[topIndex];
    if (direction === "right") {
      onLike(topCard);
    } else {
      onDismiss(topCard.name);
    }

    setTimeout(() => {
      setCardStack((prev) => prev.slice(0, -1));
      setExitDirection(null);
      setExitingIndex(null);
    }, 350);
  };

  const visibleCards = cardStack.slice(-3);

  if (visibleCards.length === 0) {
    return (
      <div className="relative flex items-center justify-center rounded-lg border-2 border-zinc-950 bg-white p-10 shadow-[5px_5px_0_#111]">
        <p className="text-center text-sm font-black text-zinc-500">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height: "420px" }}>
      <AnimatePresence initial={false}>
        {visibleCards.map((teammate, index) => {
          const stackIndex = visibleCards.length - 1 - index;
          const isTop = stackIndex === 0;
          const isExiting = isTop && exitDirection !== null;
          const depthScale = 1 - stackIndex * 0.04;
          const depthY = stackIndex * 8;

          return (
            <SwipeCard
              key={teammate.name}
              teammate={teammate}
              isTop={isTop}
              onSwipe={handleSwipe}
              exitDirection={isExiting ? exitDirection : null}
              style={{
                scale: depthScale,
                y: depthY,
                zIndex: visibleCards.length - stackIndex,
                cursor: isTop ? "grab" : "default",
                pointerEvents: isTop ? "auto" : "none",
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
