package com.back2you.back2you.Posts;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@DiscriminatorValue("FOUND")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class FoundPost extends Posts {
    @ElementCollection
    @CollectionTable(name = "found_post_security_questions", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "question")
    @OrderColumn(name = "question_order")
    @Builder.Default
    private List<String> securityQuestions = new ArrayList<>();

    @Override
    public PostsType getPostType() {
        return PostsType.FOUND;
    }
}
