package com.loan_calculator.service;

import com.loan_calculator.dto.EMIResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class LoanService {
    public List<EMIResponse> calculateReducingEMI(double principal, double annualInterestRate, int tenureMonths) {
        double monthlyInterestRate = annualInterestRate / (12 * 100);

        double emi = (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenureMonths)) /
                (Math.pow(1 + monthlyInterestRate, tenureMonths) - 1);

        List<EMIResponse> emiSchedule = new ArrayList<>();

        double remainingPrincipal = principal;

        for (int month = 1; month <= tenureMonths; month++) {
            double interestComponent = remainingPrincipal * monthlyInterestRate;
            double principalComponent = emi - interestComponent;
            remainingPrincipal -= principalComponent;

            if (remainingPrincipal < 1e-2) remainingPrincipal = 0; // Handle floating point imprecision

            emiSchedule.add(new EMIResponse(
                    month,
                    round(principalComponent),
                    round(interestComponent),
                    round(emi),
                    round(remainingPrincipal)
            ));
        }

        return emiSchedule;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}

