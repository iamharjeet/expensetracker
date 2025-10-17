package com.harjeet.expensetracker.controller;

import com.harjeet.expensetracker.dto.ExpenseDTO;
import com.harjeet.expensetracker.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExpenseController {

    private final ExpenseService expenseService;

    //GET all expenses
    @GetMapping
    public ResponseEntity<List<ExpenseDTO>> getAllExpenses(){
        List<ExpenseDTO> expenses = expenseService.getAllExpenses();
        return ResponseEntity.ok(expenses);
    }

    //GET expenses by Id
    @GetMapping("/{id}")
    public ResponseEntity<ExpenseDTO> getExpenseById(@PathVariable Long id){
        ExpenseDTO expense = expenseService.getExpenseById(id);
        return ResponseEntity.ok(expense);
    }

    //Get expenses by user id
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ExpenseDTO>> getExpensesByUserId(@PathVariable Long userId){
        List<ExpenseDTO> expenses = expenseService.getExpensesByUserId(userId);
        return ResponseEntity.ok(expenses);
    }

    //POST create a new expense
    @PostMapping
    public ResponseEntity<ExpenseDTO> createExpense(@RequestBody ExpenseDTO expenseDTO){
        ExpenseDTO createdExpense = expenseService.createExpense(expenseDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdExpense);
    }

    //PUT update a reponse
    @PutMapping("/{id}")
    public ResponseEntity<ExpenseDTO> updateExpense(@PathVariable Long id, @RequestBody ExpenseDTO expenseDTO){
        ExpenseDTO updatedExpense = expenseService.updateExpense(id, expenseDTO);
        return ResponseEntity.ok(updatedExpense);
    }

    //DELETE expense
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id){
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
