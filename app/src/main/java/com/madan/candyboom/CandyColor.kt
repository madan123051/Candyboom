package com.madan.candyboom

import android.graphics.Color

/** Available candy colors on the board. */
enum class CandyColor(val rgb: Int) {
    RED(Color.parseColor("#E53935")),
    BLUE(Color.parseColor("#1E88E5")),
    GREEN(Color.parseColor("#43A047")),
    YELLOW(Color.parseColor("#FDD835")),
    PURPLE(Color.parseColor("#8E24AA"));

    companion object {
        fun all(): List<CandyColor> = values().toList()
    }
}
