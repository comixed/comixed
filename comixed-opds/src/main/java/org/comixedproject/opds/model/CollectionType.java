package org.comixedproject.opds.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.comixedproject.model.comicbooks.ComicTagType;

/**
 * <code>CollectionType</code> names the types of collections.
 *
 * @author Darryl L. Pierce
 */
@AllArgsConstructor
public enum CollectionType {
  characters("CHARACTER", 13, ComicTagType.CHARACTER, "Characters", "characters"),
  teams("TEAM", 14, ComicTagType.TEAM, "Teams", "teams"),
  locations("LOCATION", 15, ComicTagType.LOCATION, "Locations", "locations"),
  stories("STORIES", 16, ComicTagType.STORY, "Stories", "stories");

  @Getter private String opdsIdValue;
  @Getter private Integer opdsIdKey;
  @Getter private ComicTagType comicTagType;
  @Getter private String opdsNavigationFeedTitle;
  @Getter private String opdsPathValue;
}
