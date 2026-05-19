# Candy Boom 🍬

An Android implementation of a Candy Crush-style match-3 game with a smart candy drop algorithm.

## Drop Algorithm

The `CandyDropCalculator` performs **Weighted Random Generation with Constraints**:

1. **Auto-Match Prevention** — Before dropping a candy at `(x, y)`, the system inspects neighbours `(x, y+1)/(x, y+2)` (vertical) and `(x-1, y)/(x+1, y)` (horizontal). Colors that would create an instant 3-match are removed from the candidate list.
2. **Dynamic Weights** — Colors that are *rare* on the board get a higher weight so the player has match opportunities. Frequency is counted across the full grid and inverted: `weight = max(1, totalCells / (count + 1))`.
3. **Weighted Random Pick** — A standard cumulative-weight roll picks the final color from the remaining candidates.

## Project Structure

```
app/src/main/java/com/madan/candyboom/
  ├── CandyColor.kt           # Enum of available colors
  ├── Candy.kt                # Single cell model
  ├── GameBoard.kt            # 2D grid backing the game
  ├── CandyDropCalculator.kt  # Core drop algorithm
  ├── GameView.kt             # Custom View renders the board
  └── MainActivity.kt         # Entry point
```

## Build

Open in Android Studio Hedgehog+ and run on any device with **minSdk 24** (Android 7.0).
