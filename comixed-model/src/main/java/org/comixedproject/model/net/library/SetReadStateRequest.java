package org.comixedproject.model.net.library;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * <code>SetReadStateRequest</code> is the request body for setting the read state for a set of
 * comics.
 *
 * @author Darryl L. Pierce
 */
@NoArgsConstructor
@AllArgsConstructor
public class SetReadStateRequest {
  @JsonProperty("ids")
  @Getter
  private List<Long> ids;

  @JsonProperty("read")
  @Getter
  private Boolean read;
}
