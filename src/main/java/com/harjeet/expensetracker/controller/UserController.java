package com.harjeet.expensetracker.controller;

import com.harjeet.expensetracker.dto.UserDTO;
import com.harjeet.expensetracker.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET for /api/users - to get all users
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers(){
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }


    // GET for /api/users/{id} - to get a specific user by his id
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id){
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    // POST /api/users = to create a new user
    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody Map<String, String> request) {
        UserDTO userDTO = new UserDTO();
        userDTO.setUsername(request.get("username"));
        userDTO.setEmail(request.get("email"));
        String password = request.get("password");

        UserDTO createdUser = userService.createUser(userDTO, password);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    //PUT /api/users/{id} - to update an alredy created user
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO){
        UserDTO updatedUser = userService.updateUser(id, userDTO);
        return ResponseEntity.ok(updatedUser);
    }

    //DELETE /api/users/{id} - to delete a specific user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUesr(@PathVariable Long id){
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
