package com.harjeet.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptUploadResponse {
    private Long id;
    private String fileName;
    private String s3Key;
    private Long fileSize;
    private String contentType;
    private String message;
}