package com.back2you.back2you.Posts;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@DiscriminatorValue("LOST")
@NoArgsConstructor
@SuperBuilder
public class LostPost extends Posts {
    @Override
    public PostsType getPostType() {
        return PostsType.LOST;
    }
}
