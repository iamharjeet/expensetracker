package com.harjeet.expensetracker.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptUrlResponse {
    private String presignedUrl;
    private Long expiresIn; // seconds
    private String fileName;
}
