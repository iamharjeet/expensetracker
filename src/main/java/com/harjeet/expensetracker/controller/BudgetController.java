package com.harjeet.expensetracker.controller;

import com.harjeet.expensetracker.dto.BudgetDTO;
import com.harjeet.expensetracker.model.Budget;
import com.harjeet.expensetracker.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    // Get all budgets for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BudgetDTO>> getBudgetsByUser(@PathVariable Long userId) {
        List<BudgetDTO> budgets = budgetService.getAllBudgetsByUser(userId);
        return ResponseEntity.ok(budgets);
    }

    // Get budgets for specific month and year
    @GetMapping("/user/{userId}/month/{month}/year/{year}")
    public ResponseEntity<List<BudgetDTO>> getBudgetsByUserAndMonthYear(
            @PathVariable Long userId,
            @PathVariable Integer month,
            @PathVariable Integer year) {
        List<BudgetDTO> budgets = budgetService.getBudgetsByUserAndMonthYear(userId, month, year);
        return ResponseEntity.ok(budgets);
    }

    // Get budget by ID
    @GetMapping("/{id}")
    public ResponseEntity<BudgetDTO> getBudgetById(@PathVariable Long id) {
        BudgetDTO budget = budgetService.getBudgetById(id);
        return ResponseEntity.ok(budget);
    }

    // Create new budget
    @PostMapping
    public ResponseEntity<BudgetDTO> createBudget(@RequestBody Budget budget) {
        BudgetDTO createdBudget = budgetService.createBudget(budget);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBudget);
    }

    // Update budget
    @PutMapping("/{id}")
    public ResponseEntity<BudgetDTO> updateBudget(@PathVariable Long id, @RequestBody Budget budget) {
        BudgetDTO updatedBudget = budgetService.updateBudget(id, budget);
        return ResponseEntity.ok(updatedBudget);
    }

    // Delete budget
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}
