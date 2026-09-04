package com.back2you.back2you.S3;

public class S3ObjectRetrievalException extends RuntimeException {

    public S3ObjectRetrievalException(String bucket, String key, Throwable cause) {
        super("Failed to retrieve S3 object '%s' from bucket '%s'".formatted(key, bucket), cause);
    }
}
