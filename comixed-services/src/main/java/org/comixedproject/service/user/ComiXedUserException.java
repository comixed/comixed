package org.comixedproject.service.user;

public class ComiXedUserException extends Throwable {
  public ComiXedUserException(final String message) {
    super(message);
  }

  public ComiXedUserException(final String message, final RuntimeException cause) {
    super(message, cause);
  }
}
