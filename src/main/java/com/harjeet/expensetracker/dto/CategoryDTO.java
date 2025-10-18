package com.harjeet.expensetracker.dto;

import com.harjeet.expensetracker.model.Category;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {

    private Long id;
    private String name;
    private Category.CategoryType type;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
