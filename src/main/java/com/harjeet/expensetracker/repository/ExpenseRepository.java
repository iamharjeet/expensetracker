package com.harjeet.expensetracker.repository;

import com.harjeet.expensetracker.model.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // method to find all expenses for a specific user
    List<Expense> findByUserId(Long userId);
    //method to find expenses by user, ordered by date
    List<Expense> findByUserIdOrderByDateDesc(Long userId);

    // NEW: method to find expenses by user within a date range (for reports)
    List<Expense> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    // Paginated method with ALL filters including search
    @Query(value = "SELECT * FROM expenses e " +
            "WHERE e.user_id = :userId " +
            "AND (:startDate IS NULL OR e.date >= CAST(:startDate AS DATE)) " +
            "AND (:endDate IS NULL OR e.date <= CAST(:endDate AS DATE)) " +
            "AND (:categoryId IS NULL OR e.category_id = CAST(:categoryId AS BIGINT)) " +
            "AND (:accountId IS NULL OR e.account_id = CAST(:accountId AS BIGINT)) " +
            "AND (COALESCE(:searchTerm, '') = '' OR LOWER(e.description) LIKE LOWER('%' || :searchTerm || '%')) " +
            "ORDER BY e.date DESC",
            countQuery = "SELECT COUNT(*) FROM expenses e " +
                    "WHERE e.user_id = :userId " +
                    "AND (:startDate IS NULL OR e.date >= CAST(:startDate AS DATE)) " +
                    "AND (:endDate IS NULL OR e.date <= CAST(:endDate AS DATE)) " +
                    "AND (:categoryId IS NULL OR e.category_id = CAST(:categoryId AS BIGINT)) " +
                    "AND (:accountId IS NULL OR e.account_id = CAST(:accountId AS BIGINT)) " +
                    "AND (COALESCE(:searchTerm, '') = '' OR LOWER(e.description) LIKE LOWER('%' || :searchTerm || '%'))",
            nativeQuery = true)
    Page<Expense> findByUserIdWithFilters(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("categoryId") Long categoryId,
            @Param("accountId") Long accountId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );
}
