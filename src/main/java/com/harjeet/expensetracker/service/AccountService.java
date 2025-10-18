package com.harjeet.expensetracker.service;

import com.harjeet.expensetracker.dto.AccountDTO;
import com.harjeet.expensetracker.model.Account;
import com.harjeet.expensetracker.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    public List<AccountDTO> getAllAccounts(){
        return accountRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AccountDTO> getAccountByUserId(Long userId){
        return accountRepository.findByUserIdOrderByNameAsc(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AccountDTO getAccountById(Long id){
        Account account = accountRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Account not found with id: "+ id));
        return convertToDTO(account);
    }

    public AccountDTO createAccount(AccountDTO accountDTO){
        Account account = convertToEntity(accountDTO);
        Account savedAccount = accountRepository.save(account);
        return convertToDTO(account);
    }

    public AccountDTO updateAccount(Long id, AccountDTO accountDTO){
        Account account = accountRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Account not found with id: "+ id));

        account.setName(accountDTO.getName());
        account.setBalance(accountDTO.getBalance());
        account.setType(accountDTO.getType());

        Account updatedAccount = accountRepository.save(account);
        return convertToDTO(updatedAccount);
    }

    public void deleteAccount(Long id){
        accountRepository.deleteById(id);
    }

    private AccountDTO convertToDTO(Account account){
        return new AccountDTO(
                account.getId(),
                account.getName(),
                account.getBalance(),
                account.getType(),
                account.getUserId(),
                account.getCreatedAt(),
                account.getUpdatedAt()
        );
    }

    private Account convertToEntity(AccountDTO accountDTO){
        Account account = new Account();
        account.setName(accountDTO.getName());
        account.setBalance(accountDTO.getBalance());
        account.setType(accountDTO.getType());
        account.setUserId(accountDTO.getUserId());
        return account;
    }
}
