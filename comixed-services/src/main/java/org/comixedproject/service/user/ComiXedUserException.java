package org.comixedproject.service.user;

/**
 * <code>ComiXedUserException</code> is raised if an error occurs while working with an instance of
 * {@link org.comixedproject.model.user.ComiXedUser}.
 *
 * @author Darryl L. Pierce
 */
public class ComiXedUserException extends Exception {
  public ComiXedUserException(final String message) {
    super(message);
  }

  public ComiXedUserException(final String message, final Exception cause) {
    super(message, cause);
  }
}
