package com.owl.booking.entity.type;

public enum MemberType {
    USER("일반회원"),
    ADMIN("관리자");
    
    private final String value;
    
    MemberType(String value){
        this.value = value;
    }
    
    public String getValue(){
        return value;
    }
}
