package com.harjeet.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountDTO {

    private Long id;
    private String name;
    private BigDecimal balance;
    private String type;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
