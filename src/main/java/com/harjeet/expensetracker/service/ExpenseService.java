package com.harjeet.expensetracker.service;

import com.harjeet.expensetracker.dto.ExpenseDTO;
import com.harjeet.expensetracker.model.Expense;
import com.harjeet.expensetracker.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

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
        return new ExpenseDTO(
                expense.getId(),
                expense.getDescription(),
                expense.getAmount(),
                expense.getDate(),
                expense.getUserId(),
                expense.getCreatedAt(),
                expense.getUpdatedAt()
        );
    }

    //Convert ExpenseDTO to Expense Entity
    private Expense convertToEntity(ExpenseDTO expenseDTO){
        Expense expense = new Expense();
        expense.setId(expenseDTO.getId());
        expense.setDescription(expenseDTO.getDescription());
        expense.setAmount(expenseDTO.getAmount());
        expense.setDate(expenseDTO.getDate());
        expense.setUserId(expenseDTO.getUserId());
        return expense;
    }
}
