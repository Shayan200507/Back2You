package com.back2you.back2you.User;

import com.back2you.back2you.S3.S3Service;
import com.back2you.back2you.S3.S3ObjectRetrievalException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final S3Service s3Service;

    public List<UserDto> getUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserDto::from)
                .toList();
    }

    public Optional<UserDto> getUser(Integer id) {
        return userRepository.findById(id)
                .map(UserDto::from);
    }

    public Optional<UserDto> getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(UserDto::from);
    }

    public void uploadCustomerProfileImage(Integer id, MultipartFile file){


        try {
            this.s3Service.putObject("users/%s/profile.jpg".formatted(id),file.getBytes());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    }



    public byte[] getCustomerProfileImage(Integer id){
        try {
            return  this.s3Service.getObject("users/%s/profile.jpg".formatted(id));
        } catch (S3ObjectRetrievalException e) {
            throw new ProfileImageRetrievalException(id, e);
        }
    }
}
