package com.loan_calculator.controller;

import com.loan_calculator.dto.EMIResponse;
import com.loan_calculator.service.LoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loan")
@CrossOrigin(origins = "http://localhost:5173")
public class LoanController {

    @Autowired
    private LoanService loanService;

    @GetMapping("/emi")
    public List<EMIResponse> getEMISchedule(
            @RequestParam double principal,
            @RequestParam double annualInterestRate,
            @RequestParam int tenureMonths
    ) {
        return loanService.calculateReducingEMI(principal, annualInterestRate, tenureMonths);
    }
}
