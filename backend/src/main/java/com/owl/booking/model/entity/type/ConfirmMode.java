package com.owl.booking.model.entity.type;

public enum ConfirmMode {
    AUTO("자동"),
    MANUAL("수동");
    
    private final String value;
    
    ConfirmMode(String value){
        this.value = value;
    }
    
    public String getValue(){
        return value;
    }
}
