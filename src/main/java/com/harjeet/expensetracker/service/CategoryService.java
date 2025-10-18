package com.harjeet.expensetracker.service;

import com.harjeet.expensetracker.dto.CategoryDTO;
import com.harjeet.expensetracker.model.Category;
import com.harjeet.expensetracker.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<CategoryDTO> getAllCategories(){
        return categoryRepository.findByOrderByNameAsc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CategoryDTO> getCategoriesByType(Category.CategoryType type){
        return categoryRepository.findByType(type).stream()
                .map(this:: convertToDTO)
                .collect(Collectors.toList());
    }

    public CategoryDTO getCategoryById(Long id){
        Category category = categoryRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Category not found with id: "+id));
        return convertToDTO(category);
    }

    private CategoryDTO convertToDTO(Category category){
        return new CategoryDTO(
                category.getId(),
                category.getName(),
                category.getType(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}
