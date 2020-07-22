package org.comixedproject.importer.model;

public class ComicBookItemMatcher implements ComicBookMatcher {

  private String type;

  private boolean not = false;

  private String matchOperator;

  private String value;

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

  public String getMatchOperator() {
    return this.matchOperator;
  }

  public void setMatchOperator(String matchOperator) {
    this.matchOperator = matchOperator;
  }

  public String getValue() {
    return value;
  }

  public void setValue(String value) {
    this.value = value;
  }

  @Override
  public String toString() {
    return "ComicBookItemMatcher [Type = "
        + this.type
        + ", Not = "
        + this.not
        + ", MatchOperator = "
        + this.matchOperator
        + ", Value = "
        + this.value
        + "]";
  }
}
