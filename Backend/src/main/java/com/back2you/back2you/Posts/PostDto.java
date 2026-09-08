package com.back2you.back2you.Posts;

import java.time.LocalDate;
import java.util.List;

public record PostDto(Integer id, Integer userId, List<String> imageUrls, String itemName,
                      String itemDescription, LocalDate date, String location,
                      PostsType postType, List<String> securityQuestions) {
    public static PostDto from(Posts post, List<String> imageUrls) {
        return new PostDto(post.getId(), post.getUser() == null ? null : post.getUser().getID(),
                List.copyOf(imageUrls), post.getItemName(),
                post.getItemDescription(), post.getDate(), post.getLocation(), post.getPostType(),
                post instanceof FoundPost found ? List.copyOf(found.getSecurityQuestions()) : List.of());
    }
}
