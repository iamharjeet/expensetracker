package com.harjeet.expensetracker.controller;

import com.harjeet.expensetracker.model.Expense;
import com.harjeet.expensetracker.repository.AccountRepository;
import com.harjeet.expensetracker.repository.CategoryRepository;
import com.harjeet.expensetracker.repository.ExpenseRepository;
import com.harjeet.expensetracker.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;

    // Endpoint 1: Get monthly summary (JSON)
    @GetMapping("/monthly-summary")
    public ResponseEntity<Map<String, Object>> getMonthlySummary(
            @RequestParam Long userId,
            @RequestParam int month,
            @RequestParam int year) {

        Map<String, Object> summary = reportService.getMonthlySummary(userId, month, year);
        return ResponseEntity.ok(summary);
    }

    // Endpoint 2: Export expenses to CSV
    @GetMapping("/export-csv")
    public ResponseEntity<byte[]> exportToCSV(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        // Get expenses for the date range
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

        // Build CSV content
        StringBuilder csvContent = new StringBuilder();

        // CSV Header
        csvContent.append("Date,Description,Amount,Category,Account\n");

        // CSV Rows
        for (Expense expense : expenses) {
            csvContent.append(expense.getDate()).append(",");
            csvContent.append("\"").append(expense.getDescription()).append("\",");
            csvContent.append(expense.getAmount()).append(",");

            // Get category name
            String categoryName = expense.getCategoryId() != null
                    ? categoryRepository.findById(expense.getCategoryId())
                    .map(c -> c.getName())
                    .orElse("Uncategorized")
                    : "Uncategorized";
            csvContent.append("\"").append(categoryName).append("\",");

            // Get account name
            String accountName = expense.getAccountId() != null
                    ? accountRepository.findById(expense.getAccountId())
                    .map(a -> a.getName())
                    .orElse("N/A")
                    : "N/A";
            csvContent.append("\"").append(accountName).append("\"");

            csvContent.append("\n");
        }

        // Convert to bytes
        byte[] csvBytes = csvContent.toString().getBytes();

        // Set response headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "expenses_" + startDate + "_to_" + endDate + ".csv");
        headers.setContentLength(csvBytes.length);

        return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
    }
}
