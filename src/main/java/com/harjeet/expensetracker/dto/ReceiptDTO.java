package com.harjeet.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptDTO {

    private Long id;
    private String filename;
    private String contentType;
    private Long size;
    private Long expenseId;
    private LocalDateTime uploadedAt;
}