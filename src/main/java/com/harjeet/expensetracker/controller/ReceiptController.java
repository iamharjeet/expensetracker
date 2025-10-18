package com.harjeet.expensetracker.controller;

import com.harjeet.expensetracker.dto.ReceiptDTO;
import com.harjeet.expensetracker.model.Receipt;
import com.harjeet.expensetracker.service.FileStorageService;
import com.harjeet.expensetracker.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService receiptService;
    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<ReceiptDTO> uploadReceipt(
            @RequestParam("file") MultipartFile file,
            @RequestParam("expenseId") Long expenseId) {
        ReceiptDTO receipt = receiptService.uploadReceipt(expenseId, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(receipt);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<ByteArrayResource> downloadReceipt(@PathVariable Long id) {
        Receipt receipt = receiptService.getReceiptById(id);
        byte[] fileData = fileStorageService.loadFile(receipt.getFilepath());

        ByteArrayResource resource = new ByteArrayResource(fileData);

        // Extract extension from stored filepath (which has UUID + extension)
        String extension = "";
        String filepath = receipt.getFilepath();
        int lastDotIndex = filepath.lastIndexOf(".");
        if (lastDotIndex > 0) {
            extension = filepath.substring(lastDotIndex);
        }

        // Add extension to original filename if it doesn't have one
        String downloadFilename = receipt.getFilename();
        if (!downloadFilename.toLowerCase().endsWith(extension.toLowerCase())) {
            downloadFilename = downloadFilename + extension;
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(receipt.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadFilename + "\"")
                .body(resource);
    }

    @GetMapping("/expense/{expenseId}")
    public ResponseEntity<ReceiptDTO> getReceiptByExpenseId(@PathVariable Long expenseId) {
        return receiptService.getReceiptByExpenseId(expenseId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
