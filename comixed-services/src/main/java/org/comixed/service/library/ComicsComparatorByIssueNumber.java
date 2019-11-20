package org.comixed.service.library;

import java.util.Comparator;
import org.comixed.model.library.Comic;

/**
 * <code>COmicsComparatorByIssueNumber</code> is used when sorting a list of comcis by their issue
 * numbers.
 *
 * @author Darryl L. Pierce
 */
public class ComicsComparatorByIssueNumber implements Comparator<Comic> {
  @Override
  public int compare(final Comic left, final Comic right) {
    return left.getSortableIssueNumber().compareTo(right.getSortableIssueNumber());
  }
}
