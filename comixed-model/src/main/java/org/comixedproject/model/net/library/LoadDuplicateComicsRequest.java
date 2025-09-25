package org.comixedproject.model.net.library;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * <code>LoadDuplicateComicsRequest</code> represents the request body when loading a set of
 * duplicate comics.
 *
 * @author Darryl L. Pierce
 */
@NoArgsConstructor
@AllArgsConstructor
public class LoadDuplicateComicsRequest {
  @JsonProperty("publisher")
  @Getter
  private String publisher;

  @JsonProperty("series")
  @Getter
  private String series;

  @JsonProperty("volume")
  @Getter
  private String volume;

  @JsonProperty("issueNumber")
  @Getter
  private String issueNumber;

  @JsonProperty("coverDate")
  @Getter
  private Date coverDate;

  @JsonProperty("pageIndex")
  @Getter
  private int pageIndex;

  @JsonProperty("pageSize")
  @Getter
  private int pageSize;

  @JsonProperty("sortBy")
  @Getter
  private String sortBy;

  @JsonProperty("sortDirection")
  @Getter
  private String sortDirection;
}
