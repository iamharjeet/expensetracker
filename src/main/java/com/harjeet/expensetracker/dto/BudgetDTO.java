package com.harjeet.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetDTO {
    private Long id;
    private Long userId;
    private Long categoryId;
    private String categoryName; // To display category name in frontend
    private BigDecimal monthlyLimit;
    private Integer month;
    private Integer year;
    private BigDecimal spent; // Calculated field: how much spent in this category/month
    private BigDecimal remaining; // Calculated field: monthlyLimit - spent
    private Boolean isOverBudget; // Calculated field: spent > monthlyLimit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
