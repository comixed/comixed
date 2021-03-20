package org.comixedproject.model.messaging;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

/**
 * <code>EndOfList</code> is a simple type sent to mark the end of a list.
 *
 * @author Darryl L. Pierce
 */
public final class EndOfList {
  public static final EndOfList MESSAGE = new EndOfList();

  @JsonProperty("finished")
  @Getter
  private boolean finished = true;
}
