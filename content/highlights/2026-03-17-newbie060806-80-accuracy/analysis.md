# SoloPistol vs dookiedealer (SoloPistol POV)

- White: `SoloPistol`
- Black: `dookiedealer`
- POV: `SoloPistol` (White)
- Turn labels: `me` = `SoloPistol`, `opp` = `dookiedealer`

## How The Game Was Won

- Result: `SoloPistol` beat `dookiedealer` by timeout on `47. Nc4`.
- Final sequence: `46... Re6` was met by `47. Nc4`, after which Black ran out of time.
- Finish detail: the PGN records a time-forfeit result rather than a terminal mate position.

## Significant Swings

- Config: threshold=20.0 pts, scope=pov, max-events=8, cause-mode=forensic, severity=Critical only

- [Critical] 14. Qb5 (me): W/L/D 18.8/0.0/81.2 -> 0.0/87.2/12.8, eval 0.69 -> -1.31, expected score 0.59 -> 0.06 (-53.0 pts)
  Impact: me=negative (-53.0 pts), opp=positive (+53.0 pts)
  Best: Bxc5 (Stockfish+Lc0) | Played: Qb5 | Opportunity cost: 1.85 pawns worse
  Engines: Stockfish=1.88 pawns worse, Lc0=1.82 pawns worse, confidence=High
  Evidence: SF PV Bxc5 Qxd3 Bxd3 Rfc8 Ba6 Rc7 | Lc0 PV Bxc5
  Cause: 14. Qb5 was inferior to Bxc5; it weakened coordination and handed over initiative. Evidence: expected score 0.59 -> 0.06 (-53.0 pts), Stockfish 1.88 pawns worse, Lc0 1.82 pawns worse.
  What you likely thought: The move looked playable, but a deeper safety/coordination check would have flagged the downside.
  What you missed on the board: You likely missed piece coordination and loose-piece tension after the move. After your move, the opponent also had 1 capture(s), increasing tactical volatility.
  How to decide better next time: 1) Check king safety. 2) Check loose pieces. 3) Prefer moves that improve both activity and stability.
  Practice habit: Use a fixed three-step blunder check before committing.
  Lesson: Solid coordination beats speculative activity.


- [Critical] 40. gxh3 (me): W/L/D 100.0/0.0/0.0 -> 0.3/0.8/98.9, eval M+14 -> -0.10, expected score 1.00 -> 0.50 (-50.2 pts)
  Impact: me=negative (-50.2 pts), opp=positive (+50.2 pts)
  Best: Rxh4 (Stockfish+Lc0) | Played: gxh3 | Opportunity cost: 542.06 pawns worse
  Engines: Stockfish=1000.06 pawns worse, Lc0=84.05 pawns worse, confidence=Medium
  Evidence: SF PV Rxh4 hxg2 Nf3+ Kf6 Kxg2 Kf5 | Lc0 PV Rxh4
  Cause: 40. gxh3 was inferior to Rxh4; it won material short-term but handed over tactical momentum. Evidence: expected score 1.00 -> 0.50 (-50.2 pts), Stockfish 1000.06 pawns worse, Lc0 84.05 pawns worse.
  What you likely thought: Humans are pulled toward obvious material gains and can stop calculating once a capture looks winning. The trap is ending the calculation before testing the opponent's forcing reply.
  What you missed on the board: The key missed cue is recapture/tempo risk after the grab: loose pieces, exposed king, and forcing counterplay. You captured a pawn, so recapture tempo needed deeper verification. After your move, the opponent had 2 checking idea(s), which is a forcing-warning signal.
  How to decide better next time: 1) After any tempting capture, calculate the opponent's forcing reply first. 2) Re-check king safety and piece safety two plies deep. 3) If unclear, choose the safer improving move.
  Practice habit: Treat every 'free' pawn or piece as suspicious until the tactical sequence is proven safe.
  Lesson: If a gain looks free, verify the punishment line before taking it.


- [Critical] 41. h4+ (me): W/L/D 0.5/0.5/99.0 -> 0.0/100.0/0.0, eval 0.00 -> -3.17, expected score 0.50 -> 0.00 (-50.0 pts)
  Impact: me=negative (-50.0 pts), opp=positive (+50.0 pts)
  Best: Nf3+ (Stockfish+Lc0) | Played: h4+ | Opportunity cost: 1.96 pawns worse
  Engines: Stockfish=3.09 pawns worse, Lc0=0.83 pawns worse, confidence=Medium
  Evidence: SF PV Nf3+ Kf6 Nh4 Re7 f3 Rg7+ | Lc0 PV Nf3+
  Cause: 41. h4+ was inferior to Nf3+; it stepped into a forcing sequence and reduced your practical choices. Evidence: expected score 0.50 -> 0.00 (-50.0 pts), Stockfish 3.09 pawns worse, Lc0 0.83 pawns worse.
  What you likely thought: A move can look active but still hand initiative away if the opponent gets forcing tempo moves. Humans underestimate this when they don't compare initiative after each candidate.
  What you missed on the board: You needed to count forcing replies available to the opponent after your move. After your move, the opponent also had 1 capture(s), increasing tactical volatility.
  How to decide better next time: 1) For each candidate, count opponent forcing moves. 2) Prefer candidates that reduce forcing replies. 3) Keep king and loose pieces stable.
  Practice habit: Judge candidate quality by how many forcing replies you concede.
  Lesson: Good moves reduce opponent forcing options, not just improve your own piece.


- [Critical] 42. f3 (me): W/L/D 100.0/0.0/0.0 -> 0.0/100.0/0.0, eval M+20 -> -5.58, expected score 1.00 -> 0.00 (-100.0 pts)
  Impact: me=negative (-100.0 pts), opp=positive (+100.0 pts)
  Best: Nf3+ (Stockfish+Lc0) | Played: f3 | Opportunity cost: 532.10 pawns worse
  Engines: Stockfish=1005.38 pawns worse, Lc0=58.81 pawns worse, confidence=Medium
  Evidence: SF PV Nf3+ Kf5 Kxh4 Ke4 Ng5+ Kd3 | Lc0 PV Nf3+
  Cause: 42. f3 was inferior to Nf3+; it created a large practical drop compared with safer continuations. Evidence: expected score 1.00 -> 0.00 (-100.0 pts), Stockfish 1005.38 pawns worse, Lc0 58.81 pawns worse.
  What you likely thought: Humans under time pressure often pick the first workable move instead of comparing two serious candidates. That shortcut is costly in sharp middlegames.
  What you missed on the board: The missed cue was decision quality, not only tactics: candidate comparison and safety checks were incomplete. After your move, the opponent had 2 checking idea(s), which is a forcing-warning signal.
  How to decide better next time: 1) Pick two serious candidates. 2) Run a brief CCT scan for both sides on each. 3) Choose the line with fewer immediate tactical liabilities.
  Practice habit: Never play the first acceptable move in sharp positions; compare at least two candidates.
  Lesson: Candidate comparison prevents large practical blunders.


- [Critical] 46. Nd6 (me): W/L/D 100.0/0.0/0.0 -> 0.0/100.0/0.0, eval M+18 -> -4.40, expected score 1.00 -> 0.00 (-100.0 pts)
  Impact: me=negative (-100.0 pts), opp=positive (+100.0 pts)
  Best: fxe4 (Stockfish+Lc0) | Played: Nd6 | Opportunity cost: 538.45 pawns worse
  Engines: Stockfish=1004.81 pawns worse, Lc0=72.09 pawns worse, confidence=Medium
  Evidence: SF PV fxe4 Kxf7 a4 Kf6 Kh4 Ke5 | Lc0 PV fxe4
  Cause: 46. Nd6 was inferior to fxe4; it created a large practical drop compared with safer continuations. Evidence: expected score 1.00 -> 0.00 (-100.0 pts), Stockfish 1004.81 pawns worse, Lc0 72.09 pawns worse.
  What you likely thought: Humans under time pressure often pick the first workable move instead of comparing two serious candidates. That shortcut is costly in sharp middlegames.
  What you missed on the board: The missed cue was decision quality, not only tactics: candidate comparison and safety checks were incomplete. After your move, the opponent had 2 checking idea(s), which is a forcing-warning signal.
  How to decide better next time: 1) Pick two serious candidates. 2) Run a brief CCT scan for both sides on each. 3) Choose the line with fewer immediate tactical liabilities.
  Practice habit: Never play the first acceptable move in sharp positions; compare at least two candidates.
  Lesson: Candidate comparison prevents large practical blunders.

```text
Ply   Turn Move    Win% Loss% Draw%    Eval
-------------------------------------------
1.    me  e4       3.4   0.2  96.4    0.29
1...  opp c5       9.2   0.1  90.7    0.50
2.    me  Nf3      4.7   0.1  95.2    0.36
2...  opp d6       6.0   0.1  93.9    0.41
3.    me  d3       0.6   0.8  98.6   -0.02
3...  opp g6       0.7   0.7  98.6    0.00
4.    me  Be2      0.5   0.9  98.6   -0.04
4...  opp Bg7      0.9   0.5  98.6    0.05
5.    me  O-O      0.4   0.9  98.7   -0.07
5...  opp Nc6      1.0   0.4  98.6    0.07
6.    me  Nc3      0.1   3.0  96.9   -0.29
6...  opp Bd7      0.7   0.5  98.8    0.03
7.    me  Be3      0.4   0.9  98.7   -0.08
7...  opp Nf6      0.4   0.8  98.8   -0.06
8.    me  d4       0.1   3.4  96.5   -0.33
8...  opp b6      50.4   0.0  49.6    0.95
9.    me  Qd3      3.6   0.1  96.3    0.34
9...  opp O-O      3.7   0.1  96.2    0.35
10.   me  a3       0.1   2.7  97.2   -0.29
10... opp e5       0.7   0.4  98.9    0.03
11.   me  dxe5     0.2   1.2  98.6   -0.15
11... opp dxe5     0.2   1.3  98.5   -0.17
12.   me  b4       0.0  85.1  14.9   -1.28
12... opp Be6     12.8   0.0  87.2    0.61
13.   me  bxc5     6.4   0.0  93.6    0.47
13... opp bxc5    18.8   0.0  81.2    0.69
14.   me  Qb5      0.0  87.2  12.8   -1.31
14... opp Nd7    100.0   0.0   0.0    5.11
15.   me  Qxc6   100.0   0.0   0.0    5.01
15... opp Rc8    100.0   0.0   0.0    5.17
16.   me  Qa4    100.0   0.0   0.0    4.97
16... opp f5     100.0   0.0   0.0    5.31
17.   me  exf5   100.0   0.0   0.0    5.28
17... opp Bxf5   100.0   0.0   0.0    6.07
18.   me  Bd3    100.0   0.0   0.0    4.50
18... opp Nb6    100.0   0.0   0.0    5.00
19.   me  Qxa7   100.0   0.0   0.0    4.86
19... opp e4     100.0   0.0   0.0    5.45
20.   me  Bxe4   100.0   0.0   0.0    3.57
20... opp Bxe4   100.0   0.0   0.0    5.65
21.   me  Nxe4   100.0   0.0   0.0    5.54
21... opp Re8    100.0   0.0   0.0    6.11
22.   me  Nxc5   100.0   0.0   0.0    4.50
22... opp Nd5    100.0   0.0   0.0    5.83
23.   me  Nb7    100.0   0.0   0.0    4.62
23... opp Qc7    100.0   0.0   0.0    4.92
24.   me  Rad1   100.0   0.0   0.0    2.72
24... opp Red8   100.0   0.0   0.0    7.27
25.   me  Nxd8   100.0   0.0   0.0    7.12
25... opp Nxe3   100.0   0.0   0.0   12.45
26.   me  Qxc7   100.0   0.0   0.0   12.85
26... opp Rxc7   100.0   0.0   0.0   15.17
27.   me  Ne6    100.0   0.0   0.0    7.03
27... opp Rc3    100.0   0.0   0.0    M+11
28.   me  Rde1   100.0   0.0   0.0    5.71
28... opp Nxf1   100.0   0.0   0.0    5.89
29.   me  Nxg7   100.0   0.0   0.0    5.21
29... opp Kxg7   100.0   0.0   0.0    5.99
30.   me  Kxf1   100.0   0.0   0.0    5.86
30... opp Rxc2   100.0   0.0   0.0    6.06
31.   me  h3     100.0   0.0   0.0    5.52
31... opp Rc3    100.0   0.0   0.0    6.12
32.   me  Re3    100.0   0.0   0.0    5.61
32... opp Rc4    100.0   0.0   0.0    5.68
33.   me  Ne5    100.0   0.0   0.0    5.67
33... opp Rh4    100.0   0.0   0.0    6.44
34.   me  Kg1    100.0   0.0   0.0    5.72
34... opp g5     100.0   0.0   0.0    6.38
35.   me  Kh2    100.0   0.0   0.0    5.82
35... opp h5     100.0   0.0   0.0    6.94
36.   me  Kg3    100.0   0.0   0.0    5.70
36... opp Kh6    100.0   0.0   0.0    7.28
37.   me  Kf3    100.0   0.0   0.0    6.13
37... opp g4+    100.0   0.0   0.0   35.60
38.   me  Kg3    100.0   0.0   0.0    M+12
38... opp Kg5    100.0   0.0   0.0    M+10
39.   me  Re4    100.0   0.0   0.0    M+26
39... opp gxh3   100.0   0.0   0.0    M+14
40.   me  gxh3     0.3   0.8  98.9   -0.10
40... opp Rxe4     0.5   0.5  99.0    0.00
41.   me  h4+      0.0 100.0   0.0   -3.17
41... opp Rxh4   100.0   0.0   0.0    M+20
42.   me  f3       0.0 100.0   0.0   -5.58
42... opp Re4    100.0   0.0   0.0    M+22
43.   me  Nf7+   100.0   0.0   0.0    M+20
43... opp Kf5    100.0   0.0   0.0    M+19
44.   me  Nh6+   100.0   0.0   0.0   10.10
44... opp Kg5    100.0   0.0   0.0    M+20
45.   me  Nf7+   100.0   0.0   0.0    M+19
45... opp Kf6    100.0   0.0   0.0    M+18
46.   me  Nd6      0.0 100.0   0.0   -4.40
46... opp Re6      0.0   5.9  94.1   -0.48
47.   me  Nc4      0.0 100.0   0.0   -5.00
```
