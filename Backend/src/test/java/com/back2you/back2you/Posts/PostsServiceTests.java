package com.back2you.back2you.Posts;

import com.back2you.back2you.S3.S3Service;
import com.back2you.back2you.User.User;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PostsServiceTests {
    @Test
    void deletesOwnedPostAndRejectsOtherUsersAndMissingPosts() {
        PostsRepository repository = mock(PostsRepository.class);
        PostsService service = new PostsService(repository, mock(S3Service.class));
        User owner = User.builder().ID(7).build();
        User otherUser = User.builder().ID(8).build();
        when(repository.findById(42)).thenReturn(Optional.of(LostPost.builder().id(42).user(owner).build()));
        when(repository.findById(99)).thenReturn(Optional.empty());

        ResponseStatusException forbidden = assertThrows(ResponseStatusException.class,
                () -> service.deletePostById(42, otherUser));
        assertEquals(HttpStatus.FORBIDDEN, forbidden.getStatusCode());
        ResponseStatusException missing = assertThrows(ResponseStatusException.class,
                () -> service.deletePostById(99, owner));
        assertEquals(HttpStatus.NOT_FOUND, missing.getStatusCode());
        verify(repository, never()).deleteById(any());

        service.deletePostById(42, User.builder().ID(7).build());
        verify(repository).deleteById(42);
    }

    @Test
    void getsPostByIdWithPresignedUrlsAndReturnsNotFoundForMissingPost() {
        PostsRepository repository = mock(PostsRepository.class);
        S3Service s3 = mock(S3Service.class);
        PostsService service = new PostsService(repository, s3);
        FoundPost post = FoundPost.builder().id(42).itemName("Wallet")
                .imageIds(List.of("posts/42/image"))
                .securityQuestions(List.of("What is inside?")).build();
        when(repository.findById(42)).thenReturn(java.util.Optional.of(post));
        when(repository.findById(99)).thenReturn(java.util.Optional.empty());
        when(s3.generatePresignedUrl("posts/42/image")).thenReturn("https://example.com/image?signature=test");

        PostDto dto = service.getPostById(42);
        assertEquals(42, dto.id());
        assertEquals("Wallet", dto.itemName());
        assertEquals(List.of("https://example.com/image?signature=test"), dto.imageUrls());
        assertEquals(List.of("What is inside?"), dto.securityQuestions());
        var exception = assertThrows(org.springframework.web.server.ResponseStatusException.class,
                () -> service.getPostById(99));
        assertEquals(org.springframework.http.HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(repository).findById(42);
        verify(repository).findById(99);
        verify(s3).generatePresignedUrl("posts/42/image");
        verifyNoMoreInteractions(repository, s3);
    }

    @Test
    void getsBothPostTypesForTheRequestedUserAndHandlesNoPosts() {
        PostsRepository repository = mock(PostsRepository.class);
        S3Service s3 = mock(S3Service.class);
        PostsService service = new PostsService(repository, s3);
        User user = User.builder().ID(7).build();
        LostPost lost = LostPost.builder().id(41).user(user).build();
        FoundPost found = FoundPost.builder().id(42).user(user)
                .imageIds(List.of("posts/42/first", "posts/42/second"))
                .securityQuestions(List.of("What brand is it?")).build();
        when(s3.generatePresignedUrl("posts/42/first")).thenReturn("https://example.com/first?signature=one");
        when(s3.generatePresignedUrl("posts/42/second")).thenReturn("https://example.com/second?signature=two");
        when(repository.findAllByUser(user)).thenReturn(List.of(lost, found), List.of());

        List<PostDto> posts = service.getUserPosts(user);
        assertEquals(List.of(41, 42), posts.stream().map(PostDto::id).toList());
        assertEquals(PostsType.LOST, posts.get(0).postType());
        assertTrue(posts.get(0).securityQuestions().isEmpty());
        assertTrue(posts.get(0).imageUrls().isEmpty());
        assertEquals(PostsType.FOUND, posts.get(1).postType());
        assertEquals(List.of("What brand is it?"), posts.get(1).securityQuestions());
        assertEquals(List.of("https://example.com/first?signature=one", "https://example.com/second?signature=two"),
                posts.get(1).imageUrls());
        assertEquals(List.of("posts/42/first", "posts/42/second"), found.getImageIds());
        assertTrue(service.getUserPosts(user).isEmpty());
        verify(repository, times(2)).findAllByUser(user);
        verifyNoMoreInteractions(repository);
        verify(s3).generatePresignedUrl("posts/42/first");
        verify(s3).generatePresignedUrl("posts/42/second");
        verifyNoMoreInteractions(s3);
    }

    @Test
    void savesConcretePostTypesAndFoundSecurityQuestions() {
        PostsRepository repository = mock(PostsRepository.class);
        S3Service s3 = mock(S3Service.class);
        PostsService service = new PostsService(repository, s3);
        when(repository.save(any(Posts.class))).thenAnswer(invocation -> {
            Posts post = invocation.getArgument(0);
            post.setId(42);
            return post;
        });
        FoundPostDetails details = new FoundPostDetails();
        details.setItemName("Wallet");
        details.setItemDescription("Brown wallet");
        details.setDate(LocalDate.of(2026, 9, 7));
        details.setLocation("Library");
        details.setSecurityQuestions(List.of("What is inside?", "What brand is it?"));
        User user = User.builder().ID(7).build();
        MultipartFile[] files = {new MockMultipartFile("files", new byte[]{1, 2})};

        assertEquals(42, service.createLostPost(details, files, user));
        assertEquals(42, service.createFoundPost(details, files, user));

        ArgumentCaptor<Posts> captor = ArgumentCaptor.forClass(Posts.class);
        verify(repository, times(2)).save(captor.capture());
        LostPost lost = assertInstanceOf(LostPost.class, captor.getAllValues().get(0));
        FoundPost found = assertInstanceOf(FoundPost.class, captor.getAllValues().get(1));
        assertEquals(details.getSecurityQuestions(), found.getSecurityQuestions());
        assertNotSame(details.getSecurityQuestions(), found.getSecurityQuestions());
        assertEquals(PostsType.LOST, lost.getPostType());
        assertEquals(PostsType.FOUND, found.getPostType());
        for (Posts post : captor.getAllValues()) {
            assertSame(user, post.getUser());
            assertEquals("Wallet", post.getItemName());
            assertEquals(details.getDate(), post.getDate());
            assertEquals(1, post.getImageIds().size());
            assertTrue(post.getImageIds().get(0).startsWith("posts/42/"));
            verify(s3).putObject(post.getImageIds().get(0), new byte[]{1, 2});
        }
    }
}
