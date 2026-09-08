package com.back2you.back2you.Posts;

import com.back2you.back2you.S3.S3Service;
import com.back2you.back2you.User.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostsService {
    private final PostsRepository postsRepository;
    private final S3Service s3Service;

    @Transactional
    public void deletePostById(Integer postId, User user) {
        Posts post = postsRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        if (user == null || user.getID() == null || post.getUser() == null
                || !user.getID().equals(post.getUser().getID())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own posts");
        }
        postsRepository.deleteById(postId);
    }

    @Transactional(readOnly = true)
    public PostDto getPostById(Integer postId) {
        Posts post = postsRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        return PostDto.from(post, getPresignedImageUrls(post.getImageIds()));
    }

    @Transactional(readOnly = true)
    public List<PostDto> getUserPosts(User user) {
        return postsRepository.findAllByUser(user).stream()
                .map(post -> PostDto.from(post, getPresignedImageUrls(post.getImageIds())))
                .toList();
    }

    private List<String> getPresignedImageUrls(List<String> imageKeys) {
        return imageKeys.stream()
                .map(s3Service::generatePresignedUrl)
                .toList();
    }

    @Transactional
    public Integer createLostPost(PostDetails details, MultipartFile[] files, User user) {
        return createPost(LostPost.builder().build(), details, files, user);
    }

    @Transactional
    public Integer createFoundPost(FoundPostDetails details, MultipartFile[] files, User user) {
        FoundPost post = FoundPost.builder()
                .securityQuestions(details.getSecurityQuestions() == null
                        ? new ArrayList<>() : new ArrayList<>(details.getSecurityQuestions()))
                .build();
        return createPost(post, details, files, user);
    }

    private Integer createPost(Posts post, PostDetails details, MultipartFile[] files, User user) {
        if (details.getItemName() == null || details.getItemName().isBlank()
                || details.getItemDescription() == null || details.getItemDescription().isBlank()
                || details.getDate() == null
                || details.getLocation() == null || details.getLocation().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "All post details are required");
        }
        if (files == null || files.length == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one file is required");
        }
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Files must not be empty");
            }
        }

        post.setUser(user);
        post.setItemName(details.getItemName());
        post.setItemDescription(details.getItemDescription());
        post.setDate(details.getDate());
        post.setLocation(details.getLocation());
        post = postsRepository.save(post);

        List<String> imageIds = new ArrayList<>();
        for (MultipartFile file : files) {
            String imageId = "posts/%s/%s".formatted(post.getId(), UUID.randomUUID());
            try {
                s3Service.putObject(imageId, file.getBytes());
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not read uploaded file", e);
            }
            imageIds.add(imageId);
        }

        // The saved entity is managed; the transaction persists its image IDs.
        post.setImageIds(imageIds);
        return post.getId();
    }
}
