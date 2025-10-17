package com.harjeet.expensetracker.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description;

    @Column(nullable= false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, name="user_id")
    private Long userId;

    @CreatedDate
    @Column(nullable = false, updatable = false, name="created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false, name="updated_at")
    private LocalDateTime updatedAt;
}
