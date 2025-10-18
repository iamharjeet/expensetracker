package com.harjeet.expensetracker.service;

import com.harjeet.expensetracker.dto.BudgetDTO;
import com.harjeet.expensetracker.model.Budget;
import com.harjeet.expensetracker.model.Category;
import com.harjeet.expensetracker.model.Expense;
import com.harjeet.expensetracker.repository.BudgetRepository;
import com.harjeet.expensetracker.repository.CategoryRepository;
import com.harjeet.expensetracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // Get all budgets for a user with calculated fields
    public List<BudgetDTO> getAllBudgetsByUser(Long userId) {
        List<Budget> budgets = budgetRepository.findByUserIdOrderByYearDescMonthDesc(userId);
        return budgets.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get budgets for specific month and year
    public List<BudgetDTO> getBudgetsByUserAndMonthYear(Long userId, Integer month, Integer year) {
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
        return budgets.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get budget by ID
    public BudgetDTO getBudgetById(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found with id: " + id));
        return convertToDTO(budget);
    }

    // Create new budget
    public BudgetDTO createBudget(Budget budget) {
        Budget savedBudget = budgetRepository.save(budget);
        return convertToDTO(savedBudget);
    }

    // Update budget
    public BudgetDTO updateBudget(Long id, Budget budgetDetails) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found with id: " + id));

        budget.setCategoryId(budgetDetails.getCategoryId());
        budget.setMonthlyLimit(budgetDetails.getMonthlyLimit());
        budget.setMonth(budgetDetails.getMonth());
        budget.setYear(budgetDetails.getYear());

        Budget updatedBudget = budgetRepository.save(budget);
        return convertToDTO(updatedBudget);
    }

    // Delete budget
    public void deleteBudget(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found with id: " + id));
        budgetRepository.delete(budget);
    }

    // Convert Budget entity to BudgetDTO with calculated fields
    private BudgetDTO convertToDTO(Budget budget) {
        BudgetDTO dto = new BudgetDTO();
        dto.setId(budget.getId());
        dto.setUserId(budget.getUserId());
        dto.setCategoryId(budget.getCategoryId());
        dto.setMonthlyLimit(budget.getMonthlyLimit());
        dto.setMonth(budget.getMonth());
        dto.setYear(budget.getYear());
        dto.setCreatedAt(budget.getCreatedAt());
        dto.setUpdatedAt(budget.getUpdatedAt());

        // Get category name
        Category category = categoryRepository.findById(budget.getCategoryId()).orElse(null);
        if (category != null) {
            dto.setCategoryName(category.getName());
        }

        // Calculate spent amount for this category in this month/year
        BigDecimal spent = calculateSpent(budget.getUserId(), budget.getCategoryId(), budget.getMonth(), budget.getYear());
        dto.setSpent(spent);

        // Calculate remaining
        BigDecimal remaining = budget.getMonthlyLimit().subtract(spent);
        dto.setRemaining(remaining);

        // Check if over budget
        dto.setIsOverBudget(spent.compareTo(budget.getMonthlyLimit()) > 0);

        return dto;
    }

    // Calculate total spent for a category in a given month/year
    private BigDecimal calculateSpent(Long userId, Long categoryId, Integer month, Integer year) {
        // Get start and end dates for the month
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        // Get all expenses for this user, category, and date range
        List<Expense> expenses = expenseRepository.findByUserId(userId);

        // Filter by category and date range, then sum amounts
        BigDecimal total = expenses.stream()
                .filter(e -> e.getCategoryId() != null && e.getCategoryId().equals(categoryId))
                .filter(e -> !e.getDate().isBefore(startDate) && !e.getDate().isAfter(endDate))
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return total;
    }

}
