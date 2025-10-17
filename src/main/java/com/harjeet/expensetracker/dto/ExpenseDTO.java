package com.harjeet.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseDTO {

    private Long id;
    private String description;
    private BigDecimal amount;
    private LocalDate date;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
