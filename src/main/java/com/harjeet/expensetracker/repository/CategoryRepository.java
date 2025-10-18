package com.harjeet.expensetracker.repository;

import com.harjeet.expensetracker.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByType(Category.CategoryType type);

    List<Category> findByOrderByNameAsc();
}
