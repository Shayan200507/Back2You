package com.back2you.back2you.Posts;

import com.back2you.back2you.User.User;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class PostsControllerTests {
    @Test
    void deletePostUsesAuthenticatedUserAndReturnsExpectedStatuses() throws Exception {
        PostsService service = mock(PostsService.class);
        User user = User.builder().ID(7).build();
        var authentication = new UsernamePasswordAuthenticationToken(user, null, List.of());
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new PostsController(service)).build();
        doThrow(new ResponseStatusException(HttpStatus.FORBIDDEN))
                .when(service).deletePostById(43, user);
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND))
                .when(service).deletePostById(99, user);

        mvc.perform(delete("/api/v1/posts/42").principal(authentication).param("userId", "999"))
                .andExpect(status().isNoContent()).andExpect(content().string(""));
        mvc.perform(delete("/api/v1/posts/43").principal(authentication))
                .andExpect(status().isForbidden());
        mvc.perform(delete("/api/v1/posts/99").principal(authentication))
                .andExpect(status().isNotFound());
        verify(service).deletePostById(42, user);
        verify(service).deletePostById(43, user);
        verify(service).deletePostById(99, user);
        verifyNoMoreInteractions(service);
    }

    @Test
    void getPostByIdReturnsDtoOrNotFound() throws Exception {
        PostsService service = mock(PostsService.class);
        PostDto dto = PostDto.from(LostPost.builder().id(42).user(User.builder().ID(7).build()).itemName("Wallet").build(),
                List.of("https://example.com/image?signature=test"));
        when(service.getPostById(42)).thenReturn(dto);
        when(service.getPostById(99)).thenThrow(new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND, "Post not found"));
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new PostsController(service)).build();

        mvc.perform(get("/api/v1/posts/42"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.userId").value(7))
                .andExpect(jsonPath("$.itemName").value("Wallet"))
                .andExpect(jsonPath("$.imageUrls[0]").value("https://example.com/image?signature=test"))
                .andExpect(jsonPath("$.postType").value("LOST"))
                .andExpect(jsonPath("$.user").doesNotExist());
        mvc.perform(get("/api/v1/posts/99")).andExpect(status().isNotFound());
        verify(service).getPostById(42);
        verify(service).getPostById(99);
    }

    @Test
    void getUserPostsUsesAuthenticatedUserAndReturnsPostDetails() throws Exception {
        PostsService service = mock(PostsService.class);
        User user = User.builder().ID(7).password("private-password").build();
        var authentication = new UsernamePasswordAuthenticationToken(user, null, List.of());
        PostDto post = PostDto.from(FoundPost.builder().id(42).user(user)
                .itemName("Wallet").securityQuestions(List.of("What is inside?"))
                .imageIds(List.of("posts/42/image")).build(), List.of("https://example.com/posts/42/image?signature=test"));
        when(service.getUserPosts(same(user))).thenReturn(List.of(post));
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new PostsController(service)).build();

        mvc.perform(get("/api/v1/posts/get-user-posts").principal(authentication).param("userId", "999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(42))
                .andExpect(jsonPath("$[0].userId").value(7))
                .andExpect(jsonPath("$[0].postType").value("FOUND"))
                .andExpect(jsonPath("$[0].imageUrls[0]").value("https://example.com/posts/42/image?signature=test"))
                .andExpect(jsonPath("$[0].imageIds").doesNotExist())
                .andExpect(jsonPath("$[0].securityQuestions[0]").value("What is inside?"))
                .andExpect(jsonPath("$[0].user").doesNotExist())
                .andExpect(jsonPath("$[0].password").doesNotExist());
        verify(service).getUserPosts(same(user));
        verifyNoMoreInteractions(service);
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @ParameterizedTest
    @EnumSource(PostsType.class)
    void bindsDetailsAndMultipleFilesWithEndpointType(PostsType type) throws Exception {
        PostsService service = mock(PostsService.class);
        User user = User.builder().ID(7).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of()));
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new PostsController(service))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .build();
        when(service.createLostPost(any(), any(), same(user))).thenReturn(42);
        when(service.createFoundPost(any(), any(), same(user))).thenReturn(42);

        mvc.perform(multipart("/api/v1/posts/" + type.name().toLowerCase(Locale.ROOT))
                        .file(new MockMultipartFile("files", "first.jpg", "image/jpeg", new byte[]{1}))
                        .file(new MockMultipartFile("files", "second.jpg", "image/jpeg", new byte[]{2}))
                        .param("itemName", "Wallet")
                        .param("itemDescription", "Brown wallet")
                        .param("date", "2026-09-07")
                        .param("location", "Library")
                        .param("securityQuestions[0]", "What is inside?")
                        .param("securityQuestions[1]", "What brand is it?")
                        .param("postType", "IGNORED")
                        .param("userId", "999"))
                .andExpect(status().isCreated())
                .andExpect(content().string("42"));

        ArgumentCaptor<org.springframework.web.multipart.MultipartFile[]> filesCaptor =
                ArgumentCaptor.forClass(org.springframework.web.multipart.MultipartFile[].class);
        PostDetails details;
        if (type == PostsType.FOUND) {
            ArgumentCaptor<FoundPostDetails> captor = ArgumentCaptor.forClass(FoundPostDetails.class);
            verify(service).createFoundPost(captor.capture(), filesCaptor.capture(), same(user));
            assertEquals(List.of("What is inside?", "What brand is it?"), captor.getValue().getSecurityQuestions());
            details = captor.getValue();
        } else {
            ArgumentCaptor<PostDetails> captor = ArgumentCaptor.forClass(PostDetails.class);
            verify(service).createLostPost(captor.capture(), filesCaptor.capture(), same(user));
            details = captor.getValue();
        }
        assertEquals("Wallet", details.getItemName());
        assertEquals("Brown wallet", details.getItemDescription());
        assertEquals(LocalDate.of(2026, 9, 7), details.getDate());
        assertEquals("Library", details.getLocation());
        assertEquals(2, filesCaptor.getValue().length);
        assertEquals("first.jpg", filesCaptor.getValue()[0].getOriginalFilename());
        assertEquals("second.jpg", filesCaptor.getValue()[1].getOriginalFilename());
        verifyNoMoreInteractions(service);
    }
}
