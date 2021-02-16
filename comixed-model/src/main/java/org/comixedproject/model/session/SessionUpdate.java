package org.comixedproject.model.session;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.views.View;

/**
 * <code>SessionUpdate</code> holds the content of a session update returned to the browser.
 *
 * @author Darryl L. Pierce
 */
@NoArgsConstructor
public class SessionUpdate {
  @JsonProperty("updatedComics")
  @JsonView(View.SessionUpdateView.class)
  @Getter
  @Setter
  private List<Comic> updatedComics = new ArrayList<>();

  @JsonProperty("removedComicIds")
  @JsonView(View.SessionUpdateView.class)
  @Getter
  @Setter
  private List<Long> removedComicIds = new ArrayList<>();

  @JsonProperty("importCount")
  @JsonView(View.SessionUpdateView.class)
  @Getter
  @Setter
  private Integer importCount = 0;

  @JsonProperty("hashes")
  @JsonView(View.SessionUpdateView.class)
  @Getter
  @Setter
  private List<String> hashes = new ArrayList<>();

  @JsonProperty("latest")
  @JsonView(View.SessionUpdateView.class)
  @Getter
  @Setter
  private Long latest;
}
