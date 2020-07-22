package org.comixedproject.importer.model;

import java.util.List;

public class ComicBookGroupMatcher implements ComicBookMatcher {

  private String type;

  private boolean not = false;

  private String matcherMode;

  private List<ComicBookMatcher> matchers;

  @Override
  public String getType() {
    return this.type;
  }

  @Override
  public void setType(String type) {
    this.type = type;
  }

  @Override
  public boolean isNot() {
    return this.not;
  }

  @Override
  public void setNot(boolean not) {
    this.not = not;
  }

  public String getMatcherMode() {
    return this.matcherMode;
  }

  public void setMatcherMode(String matcherMode) {
    this.matcherMode = matcherMode;
  }

  public List<ComicBookMatcher> getMatchers() {
    return this.matchers;
  }

  public void setMatchers(List<ComicBookMatcher> matchers) {
    this.matchers = matchers;
  }

  @Override
  public String toString() {
    return "ComicBookGroupMatcher [Not = "
        + this.not
        + ", MatcherMode = "
        + this.matcherMode
        + ", Matchers = "
        + this.matchers
        + "]";
  }
}
