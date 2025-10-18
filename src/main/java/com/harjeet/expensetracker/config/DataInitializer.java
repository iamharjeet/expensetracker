package com.harjeet.expensetracker.config;

import com.harjeet.expensetracker.model.Category;
import com.harjeet.expensetracker.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception{
        //only initialize if categories table is empty
        if(categoryRepository.count()==0){
            initializeCategories();
        }
    }

    private void initializeCategories(){
        List<Category> categories = Arrays.asList(
                //Income Categories
                createCategory("Salary", Category.CategoryType.INCOME),
                createCategory("Business", Category.CategoryType.INCOME),
                createCategory("Investments", Category.CategoryType.INCOME),
                createCategory("Other Income", Category.CategoryType.INCOME),

                //Expense categories
                createCategory("Food", Category.CategoryType.EXPENSE),
                createCategory("Transportation", Category.CategoryType.EXPENSE),
                createCategory("Housing", Category.CategoryType.EXPENSE),
                createCategory("Utilities", Category.CategoryType.EXPENSE),
                createCategory("Entertainment", Category.CategoryType.EXPENSE),
                createCategory("Healthcare", Category.CategoryType.EXPENSE),
                createCategory("Shopping", Category.CategoryType.EXPENSE),
                createCategory("Other Expense", Category.CategoryType.EXPENSE)
        );

        categoryRepository.saveAll(categories);
        System.out.println("Default categories initialized successfully.");
    }

    private Category createCategory(String name, Category.CategoryType type){
        Category category = new Category();
        category.setName(name);
        category.setType(type);
        return category;
    }
}
