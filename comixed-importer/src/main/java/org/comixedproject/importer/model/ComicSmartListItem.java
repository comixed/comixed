package org.comixedproject.importer.model;

import java.util.List;

public class ComicSmartListItem {

  private List<ComicBookMatcher> matchers;

  private String name;

  private boolean not = false;

  private String matcherMode;

  public List<ComicBookMatcher> getMatchers() {
    return this.matchers;
  }

  public void setMatchers(List<ComicBookMatcher> matchers) {
    this.matchers = matchers;
  }

  public String getName() {
    return this.name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public boolean isNot() {
    return this.not;
  }

  public void setNot(boolean not) {
    this.not = not;
  }

  public String getMatcherMode() {
    return this.matcherMode;
  }

  public void setMatcherMode(String matcherMode) {
    this.matcherMode = matcherMode;
  }

  @Override
  public String toString() {
    return "ComicSmartListItem [Name = "
        + this.name
        + ", Not = "
        + this.not
        + ", MatcherMode = "
        + this.matcherMode
        + ", Matchers = "
        + this.matchers
        + "]";
  }
}
