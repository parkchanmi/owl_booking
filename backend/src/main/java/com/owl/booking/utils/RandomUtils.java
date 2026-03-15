package com.owl.booking.utils;

import java.util.Random;

public class RandomUtils{


    public static String randomAlphanumeric(int size){
        StringBuilder sb = new StringBuilder();
		Random rd = new Random();

		for(int i=0;i<size;i++){

			if(rd.nextBoolean()){
				sb.append(rd.nextInt(10));
			}else {
				sb.append((char)(rd.nextInt(26)+65));
			}
		}

		return sb.toString();
    }

}