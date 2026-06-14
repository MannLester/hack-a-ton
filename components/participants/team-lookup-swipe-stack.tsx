"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  isSwiping,
}: {
  team: TeamLooking;
  isTop: boolean;
  onSwipe: (team: TeamLooking, direction: "left" | "right") => void;
  style?: React.CSSProperties;
  exitDirection: "left" | "right" | null;
  isSwiping: boolean;
}) {
  const { isSignedIn } = useClerkAuthState();
  const canSwipe = isTop && isSignedIn && !isSwiping;
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
          onSwipe(team, "right");
        } else if (info.offset.x < -SWIPE_THRESHOLD) {
          onSwipe(team, "left");
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
      <div className="flex h-full flex-col rounded-lg border-2 border-zinc-950 bg-white p-6 shadow-[6px_6px_0_#111] sm:p-7">
        <p className="text-2xl font-black text-zinc-950">{team.teamName}</p>
        <p className="mt-4 text-xs font-black uppercase tracking-wider text-zinc-400">
          Looking for
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {team.missingRoles.map((role) => (
            <span
              key={role}
              className="rounded-full border-2 border-zinc-950 bg-[#ffd21f]/20 px-3.5 py-1.5 text-sm font-extrabold text-[#7a5700]"
            >
              {role}
            </span>
          ))}
        </div>
        <div className="mt-6 border-t-2 border-zinc-100" />
        <div className="mt-5">
          <p className="text-base font-black text-zinc-950">
            {team.hackathonName}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-zinc-500">
            <MapPin className="size-4" />
            {team.hackathonLocation}
          </p>
        </div>
        <div className="mt-auto flex gap-3 pt-6">
          <AuthActionButton
            action="like_teammate"
            onAuthorizedClick={() => onSwipe(team, "left")}
            disabled={isSwiping}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md border-2 border-zinc-950 bg-white text-sm font-black text-zinc-800"
          >
            <X className="size-4" /> Pass
          </AuthActionButton>
          <AuthActionButton
            action="like_teammate"
            onAuthorizedClick={() => onSwipe(team, "right")}
            disabled={isSwiping}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[#ffd21f] text-sm font-black text-zinc-950"
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
  emptyElement,
}: {
  teams: TeamLooking[];
  onDismiss: (team: TeamLooking) => void;
  onLike: (team: TeamLooking) => void;
  emptyMessage: string;
  emptyElement?: React.ReactNode;
}) {
  const [cardStack, setCardStack] = useState(teams);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(
    null,
  );
  const [swipingTeamId, setSwipingTeamId] = useState<string | null>(null);
  const latestTeams = useRef(teams);
  const teamIds = useMemo(
    () => teams.map((team) => team.convexTeamId ?? team.teamName).join("|"),
    [teams],
  );

  useEffect(() => {
    latestTeams.current = teams;
  }, [teams]);

  useEffect(() => {
    if (swipingTeamId) return;

    setCardStack(latestTeams.current);
  }, [teamIds]);

  const handleSwipe = (team: TeamLooking, direction: "left" | "right") => {
    const teamId = team.convexTeamId ?? team.teamName;
    const topCard = cardStack[cardStack.length - 1];
    const topCardId = topCard?.convexTeamId ?? topCard?.teamName;

    if (!topCard) return;
    if (swipingTeamId) return;
    if (teamId !== topCardId) return;

    setSwipingTeamId(teamId);
    setExitDirection(direction);

    if (direction === "right") {
      onLike(topCard);
    } else {
      onDismiss(topCard);
    }

    setTimeout(() => {
      setCardStack((prev) =>
        prev.filter((card) => (card.convexTeamId ?? card.teamName) !== teamId),
      );
      setExitDirection(null);
      setSwipingTeamId(null);
    }, 350);
  };

  const visibleCards = cardStack.slice(-3);

  if (visibleCards.length === 0) {
    if (emptyElement) return emptyElement;
    return (
      <div className="relative flex items-center justify-center rounded-lg border-2 border-zinc-950 bg-white p-10 shadow-[5px_5px_0_#111]">
        <p className="text-center text-sm font-black text-zinc-500">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-[390px] w-full max-w-[680px] sm:h-[430px]">
      <AnimatePresence initial={false}>
        {visibleCards.map((team, index) => {
          const stackIndex = visibleCards.length - 1 - index;
          const isTop = stackIndex === 0;
          const isExiting = isTop && exitDirection !== null;
          const depthScale = 1 - stackIndex * 0.04;
          const depthY = stackIndex * 8;

          return (
            <TeamCard
              key={team.convexTeamId ?? team.teamName}
              team={team}
              isTop={isTop}
              onSwipe={handleSwipe}
              exitDirection={isExiting ? exitDirection : null}
              isSwiping={Boolean(swipingTeamId)}
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
