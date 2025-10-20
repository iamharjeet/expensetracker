package com.harjeet.expensetracker.service;

import com.harjeet.expensetracker.model.Expense;
import com.harjeet.expensetracker.repository.CategoryRepository;
import com.harjeet.expensetracker.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;

    public Map<String, Object> getMonthlySummary(Long userId, int month, int year) {
        // Get start and end dates for the month
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        // Get all expenses for the user in this month
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

        // Calculate total income and total expenses
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;

        for (Expense expense : expenses) {
            // Determine if it's income or expense based on category type
            String categoryType = getCategoryType(expense.getCategoryId());

            if ("INCOME".equals(categoryType)) {
                totalIncome = totalIncome.add(expense.getAmount());
            } else {
                totalExpenses = totalExpenses.add(expense.getAmount());
            }
        }

        // Calculate net balance
        BigDecimal netBalance = totalIncome.subtract(totalExpenses);

        // Get top spending categories
        List<Map<String, Object>> topCategories = getTopSpendingCategories(userId, month, year, 5);

        // Build response
        Map<String, Object> summary = new HashMap<>();
        summary.put("month", month);
        summary.put("year", year);
        summary.put("totalIncome", totalIncome);
        summary.put("totalExpenses", totalExpenses);
        summary.put("netBalance", netBalance);
        summary.put("topSpendingCategories", topCategories);

        return summary;
    }

    public List<Map<String, Object>> getTopSpendingCategories(Long userId, int month, int year, int limit) {
        // Get start and end dates for the month
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        // Get all expenses for the user in this month
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

        // Group by category and sum amounts (only for EXPENSE type categories)
        Map<Long, BigDecimal> categoryTotals = new HashMap<>();

        for (Expense expense : expenses) {
            String categoryType = getCategoryType(expense.getCategoryId());

            // Only include EXPENSE type categories
            if ("EXPENSE".equals(categoryType)) {
                categoryTotals.merge(expense.getCategoryId(), expense.getAmount(), BigDecimal::add);
            }
        }

        // Sort by amount descending and take top N
        List<Map<String, Object>> topCategories = categoryTotals.entrySet().stream()
                .sorted(Map.Entry.<Long, BigDecimal>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> categoryData = new HashMap<>();
                    categoryData.put("categoryId", entry.getKey());
                    categoryData.put("categoryName", getCategoryName(entry.getKey()));
                    categoryData.put("totalAmount", entry.getValue());
                    return categoryData;
                })
                .collect(Collectors.toList());

        return topCategories;
    }

    private String getCategoryType(Long categoryId) {
        if (categoryId == null) {
            return "EXPENSE"; // Default to EXPENSE if no category
        }
        return categoryRepository.findById(categoryId)
                .map(category -> category.getType().toString())
                .orElse("EXPENSE");
    }

    private String getCategoryName(Long categoryId) {
        if (categoryId == null) {
            return "Uncategorized";
        }
        return categoryRepository.findById(categoryId)
                .map(category -> category.getName())
                .orElse("Unknown");
    }
}
