package com.back2you.back2you.Posts;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class FoundPostDetails extends PostDetails {
    private List<String> securityQuestions = new ArrayList<>();
}
