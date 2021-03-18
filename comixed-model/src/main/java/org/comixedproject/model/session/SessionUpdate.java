package org.comixedproject.model.session;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.views.View;

/**
 * <code>SessionUpdate</code> holds the content of a session update returned to the browser.
 *
 * @author Darryl L. Pierce
 */
@AllArgsConstructor
public class SessionUpdate {
  @JsonProperty("updatedComics")
  @JsonView(View.SessionUpdateView.class)
  @Getter
  private List<Comic> updatedComics;

  @JsonProperty("removedComicIds")
  @JsonView(View.SessionUpdateView.class)
  @Getter
  private List<Long> removedComicIds;

  @JsonProperty("latest")
  @JsonView(View.SessionUpdateView.class)
  @Getter
  private Long latest;
}
