package com.harjeet.expensetracker.repository;

import com.harjeet.expensetracker.model.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {

    Optional<Receipt> findByExpenseId(Long expenseId);
}
