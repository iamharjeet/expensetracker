package com.harjeet.expensetracker.repository;

import com.harjeet.expensetracker.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // method to find all expenses for a specific user
    List<Expense> findByUserId(Long userId);
    //method to find expenses by user, ordered by date
    List<Expense> findByUserIdOrderByDateDesc(Long userId);
}
