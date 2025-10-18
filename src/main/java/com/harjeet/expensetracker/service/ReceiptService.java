package com.harjeet.expensetracker.service;


import com.harjeet.expensetracker.dto.ReceiptDTO;
import com.harjeet.expensetracker.exception.ResourceNotFoundException;
import com.harjeet.expensetracker.model.Receipt;
import com.harjeet.expensetracker.repository.ReceiptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
@Service
@RequiredArgsConstructor
public class ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final FileStorageService fileStorageService;

    public ReceiptDTO uploadReceipt(Long expenseId, MultipartFile file) {
        // Save file to disk
        String uniqueFilename = fileStorageService.saveFile(file);

        // Create receipt entity
        Receipt receipt = new Receipt();
        receipt.setFilename(file.getOriginalFilename());
        receipt.setFilepath(uniqueFilename);
        receipt.setContentType(file.getContentType());
        receipt.setSize(file.getSize());
        receipt.setExpenseId(expenseId);

        // Save to database
        Receipt savedReceipt = receiptRepository.save(receipt);

        // Return DTO
        return convertToDTO(savedReceipt);
    }

    public Receipt getReceiptById(Long id) {
        return receiptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found with id: " + id));
    }

    public Optional<ReceiptDTO> getReceiptByExpenseId(Long expenseId) {
        return receiptRepository.findByExpenseId(expenseId)
                .map(this::convertToDTO);
    }

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
