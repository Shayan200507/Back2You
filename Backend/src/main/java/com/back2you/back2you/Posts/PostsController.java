package com.back2you.back2you.Posts;

import com.back2you.back2you.User.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostsController {
    private final PostsService postsService;

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePostById(@PathVariable("postId") Integer postId,
                                               Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        postsService.deletePostById(postId, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostDto> getPostById(@PathVariable("postId") Integer postId) {
        return ResponseEntity.ok(postsService.getPostById(postId));
    }

    @GetMapping("/get-user-posts")
    public ResponseEntity<List<PostDto>> getUserPosts(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(postsService.getUserPosts(user));
    }

    @PostMapping(value = "/lost", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Integer> createLostPost(
            @ModelAttribute PostDetails details,
            @RequestParam("files") MultipartFile[] files,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(postsService.createLostPost(details, files, user));
    }

    @PostMapping(value = "/found", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Integer> createFoundPost(
            @ModelAttribute FoundPostDetails details,
            @RequestParam("files") MultipartFile[] files,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(postsService.createFoundPost(details, files, user));
    }
}
