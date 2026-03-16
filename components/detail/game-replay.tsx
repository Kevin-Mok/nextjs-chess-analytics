"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import { Chessboard } from "react-chessboard";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  StepBack,
  StepForward,
} from "lucide-react";

import { Panel } from "@/components/ui/panel";
import type { MaterialBalancePoint } from "@/lib/material";
import type { PlayerColor } from "@/types/chess";

interface GameReplayProps {
  fenByPly: string[];
  sanMoves: string[];
  playerColor: PlayerColor;
  materialSeries: MaterialBalancePoint[];
}

function MaterialTooltip({ active, payload }: TooltipContentProps) {
  const point = payload?.[0]?.payload as MaterialBalancePoint | undefined;

  if (!active || !point) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#09090c]/92 px-3 py-2 text-sm shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
      <p className="font-medium text-white">Ply {point.ply}</p>
      <p className="mt-1 text-white/58">{point.value > 0 ? "+" : ""}{point.value} material</p>
    </div>
  );
}

export function GameReplay({
  fenByPly,
  sanMoves,
  playerColor,
  materialSeries,
}: GameReplayProps) {
  const maxPly = Math.max(0, fenByPly.length - 1);
  const [currentPly, setCurrentPly] = useState(0);
  const [isAutoplaying, setIsAutoplaying] = useState(false);
  const currentFen = fenByPly[currentPly] ?? fenByPly[0];
  const currentMove = currentPly > 0 ? sanMoves[currentPly - 1] : "Initial position";

  useEffect(() => {
    if (!isAutoplaying) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentPly((value) => {
        if (value >= maxPly) {
          window.clearInterval(timer);
          setIsAutoplaying(false);
          return value;
        }

        return value + 1;
      });
    }, 700);

    return () => window.clearInterval(timer);
  }, [currentPly, isAutoplaying, maxPly]);

  const movePairs = Array.from({ length: Math.ceil(sanMoves.length / 2) }, (_, index) => ({
    moveNumber: index + 1,
    white: sanMoves[index * 2] ?? null,
    black: sanMoves[index * 2 + 1] ?? null,
    whitePly: index * 2 + 1,
    blackPly: index * 2 + 2,
  }));

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <Panel className="p-5 sm:p-6">
        <div className="space-y-5">
          <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-3">
            <Chessboard
              options={{
                id: "game-replay-board",
                position: currentFen,
                boardOrientation: playerColor,
                allowDragging: false,
                darkSquareStyle: { backgroundColor: "#6c5a3f" },
                lightSquareStyle: { backgroundColor: "#ebe3d0" },
                boardStyle: { borderRadius: "1rem", overflow: "hidden" },
              }}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                Current position
              </p>
              <p className="mt-2 text-sm text-white/72">{currentMove}</p>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                Replay progress
              </p>
              <p className="mt-2 text-sm text-white/72">
                Ply {currentPly} of {maxPly}
              </p>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={maxPly}
            value={currentPly}
            onChange={(event) => {
              setCurrentPly(Number(event.target.value));
              setIsAutoplaying(false);
            }}
            className="w-full accent-amber-200"
            aria-label="Replay move slider"
          />
          <div className="flex flex-wrap gap-2">
            <ReplayButton label="Start" onClick={() => { setCurrentPly(0); setIsAutoplaying(false); }}>
              <SkipBack className="h-4 w-4" />
            </ReplayButton>
            <ReplayButton label="Back" onClick={() => { setCurrentPly((value) => Math.max(0, value - 1)); setIsAutoplaying(false); }}>
              <StepBack className="h-4 w-4" />
            </ReplayButton>
            <ReplayButton
              label={isAutoplaying ? "Pause" : "Autoplay"}
              onClick={() => setIsAutoplaying((value) => !value)}
            >
              {isAutoplaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </ReplayButton>
            <ReplayButton label="Forward" onClick={() => { setCurrentPly((value) => Math.min(maxPly, value + 1)); setIsAutoplaying(false); }}>
              <StepForward className="h-4 w-4" />
            </ReplayButton>
            <ReplayButton label="End" onClick={() => { setCurrentPly(maxPly); setIsAutoplaying(false); }}>
              <SkipForward className="h-4 w-4" />
            </ReplayButton>
          </div>
          <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-white">
                Material balance
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-white/38">
                Player perspective
              </p>
            </div>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={materialSeries} margin={{ top: 10, right: 0, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="materialFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f5cc80" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#f5cc80" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="ply" hide />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip
                    content={(props) => <MaterialTooltip {...props} />}
                    cursor={{ stroke: "rgba(255,255,255,0.12)" }}
                  />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.18)" />
                  <ReferenceLine x={currentPly} stroke="rgba(245,204,128,0.25)" />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#f5cc80"
                    strokeWidth={2}
                    fill="url(#materialFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Panel>
      <Panel className="flex min-h-[36rem] flex-col p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Move list
            </p>
            <p className="mt-2 text-sm text-white/56">
              Click any move to jump the board to that ply.
            </p>
          </div>
        </div>
        {movePairs.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-white/56">
            No SAN move list is available for this game. The replay stays at the
            initial board state.
          </div>
        ) : (
          <div className="scrollbar-thin grid gap-2 overflow-y-auto pr-1">
            {movePairs.map((pair) => (
              <div
                key={pair.moveNumber}
                className="grid grid-cols-[3rem_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 rounded-2xl border border-white/6 bg-white/[0.02] px-3 py-2"
              >
                <span className="text-xs uppercase tracking-[0.16em] text-white/38">
                  {pair.moveNumber}
                </span>
                <MoveButton
                  active={pair.whitePly === currentPly}
                  onClick={() => {
                    setCurrentPly(pair.whitePly);
                    setIsAutoplaying(false);
                  }}
                  disabled={!pair.white}
                >
                  {pair.white ?? "—"}
                </MoveButton>
                <MoveButton
                  active={pair.blackPly === currentPly}
                  onClick={() => {
                    setCurrentPly(pair.blackPly);
                    setIsAutoplaying(false);
                  }}
                  disabled={!pair.black}
                >
                  {pair.black ?? "—"}
                </MoveButton>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

interface ReplayButtonProps {
  label: string;
  onClick: () => void;
  children: ReactNode;
}

function ReplayButton({ label, onClick, children }: ReplayButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/72 transition hover:bg-white/[0.08] hover:text-white"
    >
      {children}
      {label}
    </button>
  );
}

interface MoveButtonProps {
  active: boolean;
  onClick: () => void;
  disabled: boolean;
  children: ReactNode;
}

function MoveButton({
  active,
  onClick,
  disabled,
  children,
}: MoveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-xl px-3 py-2 text-left text-sm transition",
        active
          ? "bg-amber-200/12 text-amber-100 ring-1 ring-amber-200/22"
          : "bg-white/[0.03] text-white/68 hover:bg-white/[0.08] hover:text-white",
        disabled ? "cursor-default opacity-40" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
