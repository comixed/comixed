package org.comixedproject.auth;

import static junit.framework.TestCase.*;

import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.users.ComiXedUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.core.userdetails.UserDetails;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class JwtTokenUtilTest {
  private static final String TEST_EMAIL = "reader@comixedproject.org";

  @InjectMocks private JwtTokenUtil tokenUtil;
  @Mock private ComiXedUser user;
  @Mock private UserDetails userDetails;
  @Mock private ComiXedUserRepository userRepository;

  private String token;

  @BeforeEach
  void setUp() {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(user.getEmail()).thenReturn(TEST_EMAIL);
    Mockito.when(userDetails.getUsername()).thenReturn(TEST_EMAIL);

    tokenUtil.signingKey = "the-testing-key";
    this.token = tokenUtil.doGenerateToken(TEST_EMAIL);
  }

  @Test
  void generateToken() {
    final String result = tokenUtil.generateToken(user);

    assertNotNull(result);
    assertEquals(TEST_EMAIL, tokenUtil.getEmailFromToken(result));
  }

  @Test
  void validateToken_differentEmail() {
    assertFalse(
        tokenUtil.validateToken(tokenUtil.doGenerateToken(TEST_EMAIL.substring(1)), userDetails));
  }

  @Test
  void validateToken() {
    assertTrue(tokenUtil.validateToken(token, userDetails));
  }
}
