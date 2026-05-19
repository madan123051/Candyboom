package com.madan.candyboom

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View

/**
 * Custom view that renders the GameBoard and lets the user tap a candy
 * to "pop" it. The empty cell is then refilled using CandyDropCalculator.
 */
class GameView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyle: Int = 0
) : View(context, attrs, defStyle) {

    private val board = GameBoard(8, 8)
    private val calculator = CandyDropCalculator()
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = 0xFF202830.toInt()
    }

    init {
        calculator.fillEmpty(board)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), bgPaint)

        val cell = minOf(width, height) / board.width.toFloat()
        val pad = cell * 0.08f

        for (x in 0 until board.width) {
            for (y in 0 until board.height) {
                val candy = board.get(x, y) ?: continue
                val color = candy.color ?: continue
                paint.color = color.rgb
                val rect = RectF(
                    x * cell + pad,
                    y * cell + pad,
                    (x + 1) * cell - pad,
                    (y + 1) * cell - pad
                )
                canvas.drawRoundRect(rect, cell * 0.25f, cell * 0.25f, paint)
            }
        }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        if (event.action != MotionEvent.ACTION_DOWN) return super.onTouchEvent(event)
        val cell = minOf(width, height) / board.width.toFloat()
        val cx = (event.x / cell).toInt()
        val cy = (event.y / cell).toInt()
        if (cx in 0 until board.width && cy in 0 until board.height) {
            // Pop the tapped candy and let everything above fall down by one.
            for (y in cy downTo 1) {
                board.set(cx, y, board.get(cx, y - 1)?.color)
            }
            board.set(cx, 0, null)
            calculator.fillEmpty(board)
            invalidate()
        }
        return true
    }
}
