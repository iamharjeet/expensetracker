package com.harjeet.expensetracker.controller;

import com.harjeet.expensetracker.dto.ReceiptDTO;
import com.harjeet.expensetracker.dto.ReceiptUploadResponse;
import com.harjeet.expensetracker.dto.ReceiptUrlResponse;
import com.harjeet.expensetracker.model.Receipt;
import com.harjeet.expensetracker.service.FileStorageService;
import com.harjeet.expensetracker.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService receiptService;

//    Upload a receipt file to S3, Can optionally link to an expense
    @PostMapping("/upload")
    public ResponseEntity<ReceiptUploadResponse> uploadReceipt(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "expenseId", required = false) Long expenseId) {

        ReceiptUploadResponse response = receiptService.uploadReceipt(file, userId, expenseId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

//    Get a pre-signed URL to download/view a receipt
    @GetMapping("/{id}/url")
    public ResponseEntity<ReceiptUrlResponse> getReceiptUrl(@PathVariable Long id) {
        ReceiptUrlResponse response = receiptService.getReceiptUrl(id);
        return ResponseEntity.ok(response);
    }

//    Get receipt details by receipt ID
    @GetMapping("/{id}")
    public ResponseEntity<ReceiptDTO> getReceiptById(@PathVariable Long id) {
        ReceiptDTO receipt = receiptService.getReceiptById(id);
        return ResponseEntity.ok(receipt);
    }

//    Get receipt by expense ID
    @GetMapping("/expense/{expenseId}")
    public ResponseEntity<ReceiptDTO> getReceiptByExpenseId(@PathVariable Long expenseId) {
        return receiptService.getReceiptByExpenseId(expenseId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

//    Delete a receipt from S3 and database
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReceipt(@PathVariable Long id) {
        receiptService.deleteReceipt(id);
        return ResponseEntity.noContent().build();
    }
}