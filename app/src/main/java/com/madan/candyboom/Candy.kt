package com.madan.candyboom

/**
 * One cell on the board.
 * y = 0 is the TOP row, y = height-1 is the BOTTOM row.
 * color == null means the cell is empty and needs a drop.
 */
data class Candy(val x: Int, val y: Int, var color: CandyColor?) {
    val isEmpty: Boolean get() = color == null
}
