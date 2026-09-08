package com.back2you.back2you.Posts;

import org.springframework.data.jpa.repository.JpaRepository;
import com.back2you.back2you.User.User;

import java.util.List;
import java.util.Optional;

public interface PostsRepository extends JpaRepository<Posts,Integer> {
    @Override
    Optional<Posts> findById(Integer postId);

    @Override
    void deleteById(Integer postId);

    List<Posts> findAllByUser(User user);
}
