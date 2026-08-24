package com.back2you.back2you.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Integer> {


   @Query("SELECT u FROM User u WHERE u.email = ?1")
    Optional<User> findByEmail(String email);

   @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM user u WHERE u.email = ?1")
   boolean exists(String email);

}
