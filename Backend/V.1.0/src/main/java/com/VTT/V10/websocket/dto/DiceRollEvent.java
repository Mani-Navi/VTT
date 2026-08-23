package com.VTT.V10.websocket.dto;

import lombok.Data;
import java.util.List;

@Data
public class DiceRollEvent {
    private String username; // چه کسی تاس ریخت؟
    private String formula;  // مثلا "2d20 + 5"
    private List<Integer> results; // تک‌تک عددها [15, 8]
    private Integer total; // مجموع: 28
}