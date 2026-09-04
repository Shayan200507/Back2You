package com.back2you.back2you.User;

public record UserDto(
        Integer id,
        String firstname,
        String lastname,
        String universityName,
        String email,
        Role role
) {
    public static UserDto from(User user) {
        return new UserDto(
                user.getID(),
                user.getFirstname(),
                user.getLastname(),
                user.getUniversityName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
