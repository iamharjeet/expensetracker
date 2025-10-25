package com.harjeet.expensetracker.service;


import com.harjeet.expensetracker.dto.ReceiptDTO;
import com.harjeet.expensetracker.dto.ReceiptUploadResponse;
import com.harjeet.expensetracker.dto.ReceiptUrlResponse;
import com.harjeet.expensetracker.exception.BadRequestException;
import com.harjeet.expensetracker.exception.ResourceNotFoundException;
import com.harjeet.expensetracker.model.Expense;
import com.harjeet.expensetracker.model.Receipt;
import com.harjeet.expensetracker.repository.ExpenseRepository;
import com.harjeet.expensetracker.repository.ReceiptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final ExpenseRepository expenseRepository;
    private final S3StorageService s3StorageService;

    @Value("${aws.s3.presigned-url-expiration}")
    private Long presignedUrlExpiration;

//    Upload receipt to S3 and optionally link to expense
    @Transactional
    public ReceiptUploadResponse uploadReceipt(MultipartFile file, Long userId, Long expenseId) {
        log.info("Uploading receipt for user: {}, expense: {}", userId, expenseId);

        // Validate expense if provided
        Expense expense = null;
        if (expenseId != null) {
            expense = expenseRepository.findById(expenseId)
                    .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + expenseId));

            // Verify expense belongs to user
            if (!expense.getUserId().equals(userId)) {
                throw new BadRequestException("Expense does not belong to user");
            }

            // Check if expense already has a receipt
            Optional<Receipt> existingReceipt = receiptRepository.findByExpenseId(expenseId);
            if (existingReceipt.isPresent()) {
                throw new BadRequestException("Expense already has a receipt attached");
            }
        }

        // Upload file to S3
        String s3Key = s3StorageService.uploadFile(file, userId);

        // Create receipt entity
        Receipt receipt = new Receipt();
        receipt.setFilename(file.getOriginalFilename());
        receipt.setFilepath(s3Key); // Store S3 key instead of local path
        receipt.setContentType(file.getContentType());
        receipt.setSize(file.getSize());

        if (expenseId != null) {
            receipt.setExpenseId(expenseId);
        }

        // Save to database
        Receipt savedReceipt = receiptRepository.save(receipt);

        log.info("Receipt uploaded successfully with id: {}", savedReceipt.getId());

        return new ReceiptUploadResponse(
                savedReceipt.getId(),
                savedReceipt.getFilename(),
                savedReceipt.getFilepath(),
                savedReceipt.getSize(),
                savedReceipt.getContentType(),
                "Receipt uploaded successfully"
        );
    }

//    Get pre-signed URL for receipt download
    public ReceiptUrlResponse getReceiptUrl(Long receiptId) {
        Receipt receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found with id: " + receiptId));

        // Generate pre-signed URL
        String presignedUrl = s3StorageService.generatePresignedUrl(receipt.getFilepath());

        return new ReceiptUrlResponse(
                presignedUrl,
                presignedUrlExpiration,
                receipt.getFilename()
        );
    }

//    Delete receipt from S3 and database
    @Transactional
    public void deleteReceipt(Long receiptId) {
        Receipt receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found with id: " + receiptId));

        // Delete from S3
        s3StorageService.deleteFile(receipt.getFilepath());

        // Delete from database
        receiptRepository.delete(receipt);

        log.info("Receipt deleted successfully: {}", receiptId);
    }

//    Get receipt by ID
    public ReceiptDTO getReceiptById(Long receiptId) {
        Receipt receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found with id: " + receiptId));

        return convertToDTO(receipt);
    }

//    Get receipt by expense ID
    public Optional<ReceiptDTO> getReceiptByExpenseId(Long expenseId) {
        return receiptRepository.findByExpenseId(expenseId)
                .map(this::convertToDTO);
    }

//    Convert Receipt entity to DTO
    private ReceiptDTO convertToDTO(Receipt receipt) {
        ReceiptDTO dto = new ReceiptDTO();
        dto.setId(receipt.getId());
        dto.setFilename(receipt.getFilename());
        dto.setContentType(receipt.getContentType());
        dto.setSize(receipt.getSize());
        dto.setExpenseId(receipt.getExpenseId());
        dto.setUploadedAt(receipt.getUploadedAt());
        return dto;
    }
}