package org.comixedproject.importer.model;

public interface ComicBookMatcher {

  public String getType();

  public void setType(String name);

  public boolean isNot();

  public void setNot(boolean not);
}
