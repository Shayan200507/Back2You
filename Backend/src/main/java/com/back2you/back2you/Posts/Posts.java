package com.back2you.back2you.Posts;


import com.back2you.back2you.User.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "PostsTable")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "post_type")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public abstract class Posts {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ElementCollection
    @CollectionTable(name = "post_images", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "image_id")
    @Builder.Default
    private List<String> imageIds = new ArrayList<>();

    private String itemName;

    private String itemDescription;

    private LocalDate date;

    private String location;

    @Transient
    public abstract PostsType getPostType();

}
