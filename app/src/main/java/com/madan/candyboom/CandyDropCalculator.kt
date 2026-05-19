package com.madan.candyboom

import kotlin.random.Random

/**
 * Weighted Random Generation with Constraints.
 *
 * Step 1: Auto-Match Prevention — exclude colors that would form an instant 3-match
 *         from the candidate list using both vertical and horizontal neighbour checks.
 * Step 2: Dynamic Weights — rare colors on the board get higher weights, so the
 *         player always has a chance to make manual matches.
 * Step 3: Weighted Random Pick — cumulative-weight roll selects the final color.
 */
class CandyDropCalculator(private val random: Random = Random.Default) {

    fun calculateDropColor(x: Int, y: Int, board: GameBoard): CandyColor {
        var candidates = CandyColor.all().toMutableList()

        // 1a. Vertical check — two cells below (y+1, y+2) of same color → block it.
        val below1 = board.get(x, y + 1)?.color
        val below2 = board.get(x, y + 2)?.color
        if (below1 != null && below1 == below2) {
            candidates.remove(below1)
        }

        // 1b. Horizontal check — left and right neighbours of same color → block it.
        val left = board.get(x - 1, y)?.color
        val right = board.get(x + 1, y)?.color
        if (left != null && left == right) {
            candidates.remove(left)
        }

        // 1c. Two cells to the left (x-1, x-2) of same color
        val l1 = board.get(x - 1, y)?.color
        val l2 = board.get(x - 2, y)?.color
        if (l1 != null && l1 == l2) candidates.remove(l1)

        // 1d. Two cells to the right (x+1, x+2) of same color
        val r1 = board.get(x + 1, y)?.color
        val r2 = board.get(x + 2, y)?.color
        if (r1 != null && r1 == r2) candidates.remove(r1)

        if (candidates.isEmpty()) candidates = CandyColor.all().toMutableList()

        // 2. Weighted random pick — rare colors get higher weights.
        val freq = board.colorFrequencies()
        val total = board.totalCells().coerceAtLeast(1)
        val weights = candidates.map { color ->
            val count = freq[color] ?: 0
            // Inverse frequency, +1 avoids divide-by-zero
            (total.toDouble() / (count + 1)).coerceAtLeast(1.0)
        }
        return weightedPick(candidates, weights)
    }

    private fun <T> weightedPick(items: List<T>, weights: List<Double>): T {
        val sum = weights.sum()
        val roll = random.nextDouble() * sum
        var acc = 0.0
        for (i in items.indices) {
            acc += weights[i]
            if (roll <= acc) return items[i]
        }
        return items.last()
    }

    /** Fills every empty cell with a freshly calculated color. Top-down. */
    fun fillEmpty(board: GameBoard) {
        for (y in 0 until board.height) {
            for (x in 0 until board.width) {
                if (board.get(x, y)?.isEmpty == true) {
                    board.set(x, y, calculateDropColor(x, y, board))
                }
            }
        }
    }
}
