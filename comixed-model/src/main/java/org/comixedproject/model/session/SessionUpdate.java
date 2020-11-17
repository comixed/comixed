package org.comixedproject.model.session;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import lombok.Getter;
import lombok.Setter;
import org.comixedproject.views.View;

/**
 * <code>SessionUpdate</code> holds the content of a session update returned to the browser.
 *
 * @author Darryl L. Pierce
 */
public class SessionUpdate {
  @JsonProperty("importCount")
  @JsonView(View.SessionUpdateView.class)
  @Getter
  @Setter
  private Integer importCount = 0;
}
