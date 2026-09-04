package com.back2you.back2you.S3;


import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class S3Service {

    @Value("${aws.s3.bucket}")
    private String bucket;

    private final S3Client s3Client;


    public void  putObject(String key, byte[] data){
        PutObjectRequest putObjectRequest = PutObjectRequest.builder().bucket(bucket).key(key).build();

        this.s3Client.putObject(putObjectRequest, RequestBody.fromBytes(data));
    }


    public byte[] getObject(String key) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder().bucket(bucket).key(key).build();

        try (ResponseInputStream<GetObjectResponse> item = this.s3Client.getObject(getObjectRequest)) {
            return item.readAllBytes();
        } catch (S3Exception | IOException e) {
            throw new S3ObjectRetrievalException(bucket, key, e);
        }
    }









}
