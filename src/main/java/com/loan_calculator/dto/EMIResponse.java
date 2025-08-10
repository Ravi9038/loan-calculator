package com.loan_calculator.dto;


public class EMIResponse {
    private int month;
    private double principalComponent;
    private double interestComponent;
    private double emi;
    private double remainingPrincipal;

    // Constructors
    public EMIResponse(int month, double principalComponent, double interestComponent, double emi, double remainingPrincipal) {
        this.month = month;
        this.principalComponent = principalComponent;
        this.interestComponent = interestComponent;
        this.emi = emi;
        this.remainingPrincipal = remainingPrincipal;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public double getPrincipalComponent() {
        return principalComponent;
    }

    public void setPrincipalComponent(double principalComponent) {
        this.principalComponent = principalComponent;
    }

    public double getInterestComponent() {
        return interestComponent;
    }

    public void setInterestComponent(double interestComponent) {
        this.interestComponent = interestComponent;
    }

    public double getEmi() {
        return emi;
    }

    public void setEmi(double emi) {
        this.emi = emi;
    }

    public double getRemainingPrincipal() {
        return remainingPrincipal;
    }

    public void setRemainingPrincipal(double remainingPrincipal) {
        this.remainingPrincipal = remainingPrincipal;
    }
}
