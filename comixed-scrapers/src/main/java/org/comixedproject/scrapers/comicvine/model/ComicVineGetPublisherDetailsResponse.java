package org.comixedproject.scrapers.comicvine.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

public class ComicVineGetPublisherDetailsResponse extends AbstractComicVineQueryResponse {
  @JsonProperty("results")
  @Getter
  private ComicVinePublisher results = new ComicVinePublisher();
}
