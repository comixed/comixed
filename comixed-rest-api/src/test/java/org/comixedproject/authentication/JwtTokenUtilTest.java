package org.comixedproject.authentication;

import static junit.framework.TestCase.*;

import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.security.core.userdetails.UserDetails;

@RunWith(MockitoJUnitRunner.class)
public class JwtTokenUtilTest {
  private static final String TEST_EMAIL = "reader@comixedproject.org";

  @InjectMocks private JwtTokenUtil tokenUtil;
  @Mock private ComiXedUser user;
  @Mock private UserDetails userDetails;
  @Mock private UserService userService;

  private String token;

  @Before
  public void setUp() throws ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(user.getEmail()).thenReturn(TEST_EMAIL);
    Mockito.when(userDetails.getUsername()).thenReturn(TEST_EMAIL);

    this.token = tokenUtil.doGenerateToken(TEST_EMAIL);
  }

  @Test
  public void testGenerateToken() {
    final String result = tokenUtil.generateToken(user);

    assertNotNull(result);
    assertEquals(TEST_EMAIL, tokenUtil.getEmailFromToken(result));
  }

  @Test
  public void testValidateTokenWithDifferentEmail() {
    assertFalse(
        tokenUtil.validateToken(tokenUtil.doGenerateToken(TEST_EMAIL.substring(1)), userDetails));
  }

  @Test
  public void testValidateToken() {
    assertTrue(tokenUtil.validateToken(token, userDetails));
  }
}
