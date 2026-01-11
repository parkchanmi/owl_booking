package com.owl.booking.entity.type;

public enum MembershipStatus {
    ACTIVE("사용"),
    EXPIRED("만료");
    
    private final String value;
    
    MembershipStatus(String value){
        this.value = value;
    }
    
    public String getValue(){
        return value;
    }
}
