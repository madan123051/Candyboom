package com.madan.candyboom

/**
 * 2D grid backing the game. Internally stored as [width][height].
 * Origin (0,0) = top-left.
 */
class GameBoard(val width: Int = 8, val height: Int = 8) {

    private val grid: Array<Array<Candy>> = Array(width) { x ->
        Array(height) { y -> Candy(x, y, null) }
    }

    fun get(x: Int, y: Int): Candy? =
        if (x in 0 until width && y in 0 until height) grid[x][y] else null

    fun set(x: Int, y: Int, color: CandyColor?) {
        grid[x][y].color = color
    }

    /** Counts each color currently present on the board. */
    fun colorFrequencies(): Map<CandyColor, Int> {
        val freq = mutableMapOf<CandyColor, Int>()
        CandyColor.all().forEach { freq[it] = 0 }
        for (x in 0 until width) for (y in 0 until height) {
            grid[x][y].color?.let { freq[it] = (freq[it] ?: 0) + 1 }
        }
        return freq
    }

    fun totalCells(): Int = width * height
}
