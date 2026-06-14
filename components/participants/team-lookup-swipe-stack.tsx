"use client";

import { useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Heart, MapPin, X } from "lucide-react";
import type { TeamLooking } from "@/lib/sample-data";
import { AuthActionButton } from "@/components/shared/auth-controls";
import { useClerkAuthState } from "@/components/shared/convex-provider";

const SWIPE_THRESHOLD = 100;
const EXIT_X = 1000;

function TeamCard({
  team,
  isTop,
  onSwipe,
  style,
  exitDirection,
}: {
  team: TeamLooking;
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
          : {
              scale: style?.scale ?? 1,
              y: style?.y ?? 0,
              opacity: style?.opacity ?? 1,
            }
      }
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      whileTap={canSwipe ? { cursor: "grabbing" } : undefined}
    >
      <div className="flex h-full flex-col rounded-lg border-2 border-zinc-950 bg-white p-5 shadow-[5px_5px_0_#111]">
        <p className="text-xl font-black text-zinc-950">{team.teamName}</p>
        <p className="mt-3 text-xs font-black uppercase tracking-wider text-zinc-400">
          Looking for
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {team.missingRoles.map((role) => (
            <span
              key={role}
              className="rounded-full border-2 border-zinc-950 bg-[#ffd21f]/20 px-3 py-1 text-sm font-extrabold text-[#7a5700]"
            >
              {role}
            </span>
          ))}
        </div>
        <div className="mt-4 border-t-2 border-zinc-100" />
        <div className="mt-4">
          <p className="text-sm font-black text-zinc-950">
            {team.hackathonName}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-zinc-500">
            <MapPin className="size-3" />
            {team.hackathonLocation}
          </p>
        </div>
        <div className="mt-auto flex gap-2 pt-4">
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

export function TeamSwipeStack({
  teams,
  onDismiss,
  onLike,
  emptyMessage,
}: {
  teams: TeamLooking[];
  onDismiss: (team: TeamLooking) => void;
  onLike: (team: TeamLooking) => void;
  emptyMessage: string;
}) {
  const [cardStack, setCardStack] = useState(teams);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(
    null,
  );

  const handleSwipe = (direction: "left" | "right") => {
    const topCard = cardStack[cardStack.length - 1];
    if (!topCard) return;

    setExitDirection(direction);

    if (direction === "right") {
      onLike(topCard);
    } else {
      onDismiss(topCard);
    }

    setTimeout(() => {
      setCardStack((prev) => prev.slice(0, -1));
      setExitDirection(null);
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
    <div className="relative mx-auto w-full" style={{ height: "300px", maxWidth: "480px" }}>
      <AnimatePresence initial={false}>
        {visibleCards.map((team, index) => {
          const stackIndex = visibleCards.length - 1 - index;
          const isTop = stackIndex === 0;
          const isExiting = isTop && exitDirection !== null;
          const depthScale = 1 - stackIndex * 0.04;
          const depthY = stackIndex * 8;

          return (
            <TeamCard
              key={team.teamName}
              team={team}
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
