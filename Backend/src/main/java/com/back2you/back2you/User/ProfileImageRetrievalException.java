package com.back2you.back2you.User;

public class ProfileImageRetrievalException extends RuntimeException {

    public ProfileImageRetrievalException(Integer userId, Throwable cause) {
        super("Could not retrieve profile image for user id %s".formatted(userId), cause);
    }
}
