package com.harjeet.expensetracker.service;

import com.harjeet.expensetracker.dto.ExpenseDTO;
import com.harjeet.expensetracker.model.Account;
import com.harjeet.expensetracker.model.Expense;
import com.harjeet.expensetracker.repository.AccountRepository;
import com.harjeet.expensetracker.repository.CategoryRepository;
import com.harjeet.expensetracker.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private AccountRepository accountRepository;

    //Get all expenses
    public List<ExpenseDTO> getAllExpenses(){
        return expenseRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    //Get expense by ID
    public ExpenseDTO getExpenseById(Long id){
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Expense not found with id: "+ id));
        return convertToDTO(expense);
    }

    //Get all expenses for a specific user
    public List<ExpenseDTO> getExpensesByUserId(Long userId) {
        return expenseRepository.findByUserIdOrderByDateDesc(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    //NEW: Get paginated and filtered expenses for a specific user
    public Map<String, Object> getExpensesWithFilters(
            Long userId,
            LocalDate startDate,
            LocalDate endDate,
            Long categoryId,
            Long accountId,
            String searchTerm,
            int page,
            int size
    ) {
        // Create pageable object with sorting by date descending
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());

        // Get paginated results from repository
        Page<Expense> expensePage = expenseRepository.findByUserIdWithFilters(
                userId, startDate, endDate, categoryId, accountId,searchTerm, pageable
        );

        // Convert expenses to DTOs
        List<ExpenseDTO> expenseDTOs = expensePage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        // Build response with pagination metadata
        Map<String, Object> response = new HashMap<>();
        response.put("expenses", expenseDTOs);
        response.put("currentPage", expensePage.getNumber());
        response.put("totalPages", expensePage.getTotalPages());
        response.put("totalItems", expensePage.getTotalElements());
        response.put("pageSize", expensePage.getSize());
        response.put("hasNext", expensePage.hasNext());
        response.put("hasPrevious", expensePage.hasPrevious());

        return response;
    }

    //Create a new expense
    public ExpenseDTO createExpense(ExpenseDTO expenseDTO){
        Expense expense = convertToEntity(expenseDTO);
        Expense savedExpense = expenseRepository.save(expense);
        return convertToDTO(savedExpense);
    }

    //Update an existing expense
    public ExpenseDTO updateExpense(Long id, ExpenseDTO expenseDTO){
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Expense not found with id "+ id));

        expense.setDescription(expenseDTO.getDescription());
        expense.setAmount(expenseDTO.getAmount());
        expense.setDate(expenseDTO.getDate());

        expense.setCategoryId(expenseDTO.getCategoryId());
        expense.setAccountId(expenseDTO.getAccountId());
        expense.setUserId(expenseDTO.getUserId());

        Expense updatedExpense = expenseRepository.save(expense);
        return convertToDTO(updatedExpense);
    }

    //Delete an expense
    public void deleteExpense(Long id){
        if(!expenseRepository.existsById(id)){
            throw new RuntimeException("Expense not found with id: "+id);
        }
        expenseRepository.deleteById(id);
    }

    // Convert Expense entity to ExpenseDTO
    private ExpenseDTO convertToDTO(Expense expense){
        ExpenseDTO dto = new ExpenseDTO(
                expense.getId(),
                expense.getDescription(),
                expense.getAmount(),
                expense.getDate(),
                expense.getUserId(),
                expense.getCategoryId(),
                expense.getAccountId(),
                null,  // categoryName - will be set below
                null,                   // accountName - will be set below
                expense.getCreatedAt(),
                expense.getUpdatedAt()
        );

        // Fetch and set category name if categoryId exists
        if(expense.getCategoryId()!=null){
            categoryRepository.findById(expense.getCategoryId())
                    .ifPresent(category -> dto.setCategoryName(category.getName()));
        }

        // Fetch and set account name if accountId  exists
        if(expense.getAccountId()!= null){
            accountRepository.findById(expense.getAccountId())
                    .ifPresent(account -> dto.setAccountName(account.getName()));
        }
        return dto;
    }

    //Convert ExpenseDTO to Expense Entity
    private Expense convertToEntity(ExpenseDTO expenseDTO){
        Expense expense = new Expense();
        expense.setId(expenseDTO.getId());
        expense.setDescription(expenseDTO.getDescription());
        expense.setAmount(expenseDTO.getAmount());
        expense.setDate(expenseDTO.getDate());
        expense.setUserId(expenseDTO.getUserId());
        expense.setCategoryId(expenseDTO.getCategoryId());
        expense.setAccountId(expenseDTO.getAccountId());
        return expense;
    }
}
